from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from backend.models import Vehicle
import uvicorn

app = FastAPI()

# Конфигурация
DB_URL = "sqlite:///./test.db"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

@app.post("/location")
def update_location(data: dict):
    db = SessionLocal()
    try:
        vehicle = db.query(Vehicle).filter(Vehicle.device_id.like(f"%{data['device_id']}%")).first()
        if vehicle:
            vehicle.current_location_lat = data['latitude']
            vehicle.current_location_lng = data['longitude']
            vehicle.speed = data['speed']
            vehicle.last_update = datetime.now()
            
            # Обновляем пробег
            if vehicle.daily_mileage is None:
                vehicle.daily_mileage = 0
            distance = data['speed'] * (5/3600)  # km за 5 секунд
            vehicle.daily_mileage += distance
            vehicle.mileage += distance
            
            db.commit()
            return {"status": "ok"}
        else:
            print(f"Vehicle not found for device_id containing: {data['device_id']}")
            return {"status": "error", "message": "Vehicle not found"}
    finally:
        db.close()

@app.post("/status")
def update_status(data: dict):
    db = SessionLocal()
    try:
        vehicle = db.query(Vehicle).filter(Vehicle.device_id.like(f"%{data['device_id']}%")).first()
        if vehicle:
            vehicle.status = 'online' if data['enabled'] else 'disabled'
            vehicle.last_update = datetime.now()
            db.commit()
            return {"status": "ok"}
        else:
            print(f"Vehicle not found for device_id containing: {data['device_id']}")
            return {"status": "error", "message": "Vehicle not found"}
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 