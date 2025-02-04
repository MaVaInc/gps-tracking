from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, time
import struct
import zlib
import os
import aiohttp
from pydantic import BaseModel
from math import radians, sin, cos, sqrt, atan2
from sqlalchemy import create_engine

from backend.database import Base
from backend.models import Vehicle, LocationHistory

# Используем ту же конфигурацию БД, что и в main.py
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
print(f"Using database at: {SQLALCHEMY_DATABASE_URL}")

# Создаем сессию для работы с БД
from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        vehicles = db.query(Vehicle).all()
        print(f"Database connection successful, found {len(vehicles)} vehicles")
        yield db
    finally:
        db.close()

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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
                distance = calculate_distance_km(
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
        print(f"Stack trace:", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Добавим модель для валидации данных
class ControlAction(BaseModel):
    action: str

@app.post("/api/vehicles/{vehicle_id}/control")
async def control_vehicle(vehicle_id: int, action: ControlAction, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    try:
        if action.action not in ["enable", "disable"]:
            raise HTTPException(status_code=400, detail="Invalid action")

        async with aiohttp.ClientSession() as session:
            response = await session.post(
                f"http://localhost:8002/device/{vehicle.device_id}/control",
                json={"action": action.action}
            )
            if response.status == 200:
                # Обновляем статус в БД
                vehicle.status = 'disabled' if action.action == 'disable' else 'online'
                db.commit()
                return {"status": "success", "vehicle_status": vehicle.status}
            else:
                raise HTTPException(status_code=500, detail="Failed to control vehicle")
    except Exception as e:
        print(f"Error controlling vehicle: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True) 