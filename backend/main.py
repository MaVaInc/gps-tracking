from fastapi import FastAPI, WebSocket, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import socketio
from datetime import datetime, time
from backend.database import SessionLocal, engine, Base
from backend.models import Vehicle, Part, LocationHistory
from backend import schemas
from backend import crud
import json
from math import radians, sin, cos, sqrt, atan2
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from pydantic import BaseModel
import struct
import zlib
import traceback

load_dotenv()

# В начале файла
DEBUG = True  # Включаем дебаг

# Обновляем подключение к БД
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)  # echo=True для логов SQL

# Создаем экземпляр Socket.IO
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:5173']
)

# Создаем FastAPI приложение
app = FastAPI()

# Создаем приложение Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Добавляем CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем таблицы при старте
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Socket.IO события
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def vehicle_update(sid, data):
    await sio.emit('vehicle_update', data)

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Вычисляет расстояние между двумя точками в километрах
    используя формулу гаверсинусов
    """
    R = 6371  # Радиус Земли в километрах

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c

    return distance

# REST API endpoints
@app.get("/vehicles/", response_model=List[schemas.VehicleResponse])
@app.get("/api/vehicles/", response_model=List[schemas.VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    
    # Получаем начало текущего дня
    today_start = datetime.combine(datetime.today(), time.min)
    
    result = []
    for v in vehicles:
        # Получаем последнюю запись о местоположении за сегодня
        today_locations = db.query(LocationHistory)\
            .filter(LocationHistory.vehicle_id == v.id)\
            .filter(LocationHistory.timestamp >= today_start)\
            .order_by(LocationHistory.timestamp.asc())\
            .all()
        
        # Рассчитываем дневной пробег
        daily_mileage = 0
        if len(today_locations) > 1:
            for i in range(1, len(today_locations)):
                prev = today_locations[i-1]
                curr = today_locations[i]
                # Расчет расстояния между точками
                distance = calculate_distance(
                    prev.lat, prev.lng,
                    curr.lat, curr.lng
                )
                daily_mileage += distance
        
        result.append({
            "id": v.id,
            "device_id": v.device_id,
            "name": v.name,
            "year": v.year,
            "plate_number": v.plate_number,
            "driver_name": v.driver_name,
            "status": v.status,
            "speed": v.speed,
            "mileage": int(v.mileage),
            "daily_mileage": int(daily_mileage),
            "current_location_lat": v.current_location_lat,
            "current_location_lng": v.current_location_lng,
            "last_update": v.last_update,
            # Все поля обслуживания
            "last_oil_change": v.last_oil_change,
            "next_oil_change": v.next_oil_change,
            "last_brake_change": v.last_brake_change,
            "next_brake_change": v.next_brake_change,
            "last_filter_change": v.last_filter_change,
            "next_filter_change": v.next_filter_change,
            "last_timing_belt_change": v.last_timing_belt_change,
            "next_timing_belt_change": v.next_timing_belt_change,
            "last_clutch_change": v.last_clutch_change,
            "next_clutch_change": v.next_clutch_change,
            "last_battery_change": v.last_battery_change,
            "next_battery_change": v.next_battery_change,
            "last_tires_change": v.last_tires_change,
            "next_tires_change": v.next_tires_change,
            "last_shock_absorbers_change": v.last_shock_absorbers_change,
            "next_shock_absorbers_change": v.next_shock_absorbers_change
        })
    
    return result

@app.get("/parts/")
@app.get("/api/parts/")
def get_parts(db: Session = Depends(get_db)):
    parts = db.query(Part).all()
    return [
        {
            "id": part.id,
            "name": part.name,
            "description": part.description,
            "quantity": part.quantity,
            "min_quantity": part.min_quantity,
            "price": part.price,
            "compatible_vehicles": part.compatible_vehicles if part.compatible_vehicles else []
        }
        for part in parts
    ]

@app.get("/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@app.get("/parts/{part_id}", response_model=schemas.Part)
def get_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@app.post("/api/parts/", response_model=schemas.Part)
def create_part(part: schemas.PartCreate, db: Session = Depends(get_db)):
    try:
        # Создаем новую запчасть
        db_part = Part(
            name=part.name,
            description=part.description,
            quantity=part.quantity,
            min_quantity=part.min_quantity,
            price=part.price,
            compatible_vehicles=part.compatible_vehicles
        )
        
        db.add(db_part)
        db.commit()
        db.refresh(db_part)
        
        return db_part
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/parts/{part_id}", response_model=schemas.Part)
def update_part(part_id: int, part: schemas.PartUpdate, db: Session = Depends(get_db)):
    return crud.update_part(db=db, part_id=part_id, part=part)

@app.delete("/parts/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db)):
    crud.delete_part(db=db, part_id=part_id)
    return {"message": "Part deleted"}

@app.post("/gps/data")
async def receive_gps_data(data: dict, db: Session = Depends(get_db)):
    try:
        device_id = data.get('device_id')
        if not device_id:
            raise HTTPException(status_code=400, detail="Missing device_id")

        # Находим машину в БД по device_id
        vehicle = db.query(Vehicle).filter(Vehicle.device_id == device_id).first()
        if not vehicle:
            print(f"Vehicle not found: {device_id}")
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Обновляем данные
        vehicle.speed = float(data.get('speed', 0))
        vehicle.current_location_lat = float(data.get('latitude'))
        vehicle.current_location_lng = float(data.get('longitude'))
        vehicle.last_update = datetime.utcnow()
        vehicle.status = 'online'

        db.commit()

        # Отправляем обновление через WebSocket
        vehicle_data = {
            "id": vehicle.id,
            "device_id": vehicle.device_id,
            "name": vehicle.name,
            "status": vehicle.status,
            "speed": vehicle.speed,
            "latitude": vehicle.current_location_lat,
            "longitude": vehicle.current_location_lng,
            "driver_name": vehicle.driver_name,
            "plate_number": vehicle.plate_number,
            "mileage": vehicle.mileage,
            "year": vehicle.year,
            "timestamp": vehicle.last_update.isoformat()
        }
        
        print(f"Sending vehicle update: {vehicle_data}")
        await sio.emit('vehicle_update', vehicle_data)
        
        return {"status": "success"}
    except Exception as e:
        print(f"Error processing GPS data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/vehicles/{vehicle_id}", response_model=schemas.VehicleResponse)
def update_vehicle(vehicle_id: int, vehicle: schemas.VehicleUpdate, db: Session = Depends(get_db)):
    db_vehicle = crud.get_vehicle(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Сохраняем текущее значение last_update
    current_last_update = db_vehicle.last_update
    
    # Обновляем машину
    updated_vehicle = crud.update_vehicle(db=db, vehicle=db_vehicle, vehicle_update=vehicle)
    
    # Восстанавливаем last_update
    updated_vehicle.last_update = current_last_update
    db.commit()
    
    # Формируем ответ в формате VehicleResponse
    return {
        "id": updated_vehicle.id,
        "device_id": updated_vehicle.device_id,
        "name": updated_vehicle.name,
        "year": updated_vehicle.year,
        "plate_number": updated_vehicle.plate_number,
        "driver_name": updated_vehicle.driver_name,
        "status": updated_vehicle.status,
        "speed": updated_vehicle.speed,
        "mileage": updated_vehicle.mileage,
        "daily_mileage": 0,  # Это можно вычислить если нужно
        "current_location_lat": updated_vehicle.current_location_lat,
        "current_location_lng": updated_vehicle.current_location_lng,
        "last_update": updated_vehicle.last_update,
        "last_oil_change": updated_vehicle.last_oil_change,
        "next_oil_change": updated_vehicle.next_oil_change,
        "last_brake_change": updated_vehicle.last_brake_change,
        "next_brake_change": updated_vehicle.next_brake_change,
        "last_filter_change": updated_vehicle.last_filter_change,
        "next_filter_change": updated_vehicle.next_filter_change,
        "last_timing_belt_change": updated_vehicle.last_timing_belt_change,
        "next_timing_belt_change": updated_vehicle.next_timing_belt_change,
        "last_clutch_change": updated_vehicle.last_clutch_change,
        "next_clutch_change": updated_vehicle.next_clutch_change,
        "last_battery_change": updated_vehicle.last_battery_change,
        "next_battery_change": updated_vehicle.next_battery_change,
        "last_tires_change": updated_vehicle.last_tires_change,
        "next_tires_change": updated_vehicle.next_tires_change,
        "last_shock_absorbers_change": updated_vehicle.last_shock_absorbers_change,
        "next_shock_absorbers_change": updated_vehicle.next_shock_absorbers_change
    }

@app.get("/api/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = crud.get_vehicle(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

class ControlAction(BaseModel):
    action: str

@app.post("/api/vehicles/{vehicle_id}/control")
async def control_vehicle(vehicle_id: int, action: ControlAction, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    try:
        if action.action == "disable":
            vehicle.status = "disabled"
        elif action.action == "enable":
            vehicle.status = "online"
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        db.commit()
        return {"status": "success", "vehicle_status": vehicle.status}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gps/binary_data")
async def receive_binary_data(request: Request, db: Session = Depends(get_db)):
    try:
        print("Получен новый GPS пакет")
        raw_data = await request.body()
        print(f"Размер сжатых данных: {len(raw_data)} байт")
        
        data = zlib.decompress(raw_data)
        print(f"Размер распакованных данных: {len(data)} байт")
        
        device_id, lat, lng, speed, timestamp = struct.unpack("16sddfI", data)
        device_id = device_id.decode('utf-8').strip('\0').lower().replace('b-', '')
        
        print(f"""
Распакованные данные:
- device_id: {device_id}
- lat: {lat}
- lng: {lng}
- speed: {speed}
- timestamp: {datetime.fromtimestamp(timestamp)}
        """)

        vehicle = db.query(Vehicle).filter(Vehicle.device_id == device_id).first()
        if not vehicle:
            print(f"Vehicle not found: {device_id}")
            print("Available vehicles in DB:")
            vehicles = db.query(Vehicle).all()
            for v in vehicles:
                print(f"- {v.device_id}: {v.name}")
            raise HTTPException(status_code=404, detail=f"Vehicle not found: {device_id}")
        
        print(f"Найдено транспортное средство: {vehicle.name} (ID: {vehicle.id})")
        
        # Получаем начало текущего дня
        today_start = datetime.combine(datetime.today(), time.min)
        
        # Получаем последнюю запись о местоположении за сегодня
        last_location = db.query(LocationHistory)\
            .filter(LocationHistory.vehicle_id == vehicle.id)\
            .filter(LocationHistory.timestamp >= today_start)\
            .order_by(LocationHistory.timestamp.desc())\
            .first()

        # Сохраняем новую запись о местоположении
        new_location = LocationHistory(
            vehicle_id=vehicle.id,
            lat=lat,
            lng=lng,
            timestamp=datetime.fromtimestamp(timestamp)
        )
        db.add(new_location)

        # Обновляем данные только если машина не отключена
        if vehicle.status != 'disabled':
            # Рассчитываем пройденное расстояние
            if last_location:
                distance = calculate_distance(
                    last_location.lat,
                    last_location.lng,
                    lat,
                    lng
                )
                # Обновляем дневной пробег
                vehicle.daily_mileage = (vehicle.daily_mileage or 0) + distance
                # Обновляем общий пробег
                vehicle.mileage = (vehicle.mileage or 0) + distance

            # Обновляем текущие координаты и статус
            vehicle.current_location_lat = lat
            vehicle.current_location_lng = lng
            vehicle.speed = speed
            vehicle.last_update = datetime.fromtimestamp(timestamp)
            vehicle.status = 'online'
        
        print(f"""
Обновлены данные для {vehicle.name}:
- Новая позиция: {lat}, {lng}
- Скорость: {speed}
- Статус: {vehicle.status}
- Пробег: {vehicle.mileage}
- Дневной пробег: {vehicle.daily_mileage}
        """)
        
        db.commit()
        return {"status": "success"}
        
    except Exception as e:
        print(f"Error processing GPS data: {e}")
        print("Stack trace:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Запускаем приложение с Socket.IO
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000) 