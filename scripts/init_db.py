import os
import sys
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.database import Base, engine
from backend.models import Vehicle, Part, ServiceRecord, LocationHistory
import json
from datetime import datetime

# Получаем абсолютный путь к корневой директории проекта
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

def seed_parts():
    db = SessionLocal()
    try:
        db.query(Part).delete()
        
        test_parts = [
            {
                "name": "Тормозные колодки",
                "description": "Передние тормозные колодки для Toyota Proace",
                "quantity": 10,
                "min_quantity": 2,
                "location": "Склад A1",
                "price": 150.00,
                "compatible_vehicles": json.dumps(["eqw1054"])  # device_id машины
            },
            {
                "name": "Масляный фильтр",
                "description": "Масляный фильтр для Ford Transit",
                "quantity": 15,
                "min_quantity": 5,
                "location": "Склад B2",
                "price": 25.00,
                "compatible_vehicles": json.dumps(["eqe2152"])  # device_id машины
            }
        ]
        
        for part_data in test_parts:
            part = Part(**part_data)
            db.add(part)
        
        db.commit()
        print("Added test parts to database")
    except Exception as e:
        print(f"Error seeding parts: {e}")
        db.rollback()
    finally:
        db.close()

def init_db():
    print("Recreating database tables...")

    # Удаляем все таблицы
    Base.metadata.drop_all(bind=engine)

    # Создаем все таблицы заново
    Base.metadata.create_all(bind=engine)

    print("Database tables recreated successfully!")

    # Инициализируем тестовые данные
    db = SessionLocal()

    # Создаем тестовые машины
    vehicles_data = [
        {
            "device_id": "eqw1054",
            "name": "Proace",
            "year": 2018,
            "plate_number": "B-EQW1054",
            "driver_name": "Hans Schmidt",
            "status": "online",
            "speed": 0.0,
            "mileage": 120000,
            "current_location_lat": 52.5200,
            "current_location_lng": 13.4050,
            "last_oil_change": 110000,
            "last_brake_change": 115000,
            "last_filter_change": 117000,
            "last_timing_belt_change": 90000,
            "last_clutch_change": 80000,
            "last_battery_change": 100000,
            "last_tires_change": 105000,
            "last_shock_absorbers_change": 95000
        },
        {
            "device_id": "eqe2152",
            "name": "Transit",
            "year": 2012,
            "plate_number": "B-EQE2152",
            "driver_name": "Klaus Weber",
            "status": "online",
            "speed": 0.0,
            "mileage": 120000,
            "current_location_lat": 52.5200,
            "current_location_lng": 13.4050,
            "last_oil_change": 110000,
            "last_brake_change": 115000,
            "last_filter_change": 117000,
            "last_timing_belt_change": 90000,
            "last_clutch_change": 80000,
            "last_battery_change": 100000,
            "last_tires_change": 105000,
            "last_shock_absorbers_change": 95000
        },
        {
            "device_id": "efa1037",
            "name": "Transit",
            "year": 2010,
            "plate_number": "B-EFA1037",
            "driver_name": "Michael Müller",
            "status": "online",
            "speed": 0.0,
            "mileage": 150000,
            "current_location_lat": 52.3200,
            "current_location_lng": 13.2050,
            "last_oil_change": 140000,
            "last_brake_change": 145000,
            "last_filter_change": 147000,
            "last_timing_belt_change": 120000,
            "last_clutch_change": 100000,
            "last_battery_change": 130000,
            "last_tires_change": 135000,
            "last_shock_absorbers_change": 125000
        },
        {
            "device_id": "eqb8960",
            "name": "Transit",
            "year": 2012,
            "plate_number": "B-EQB8960",
            "driver_name": "Thomas Wagner",
            "status": "online",
            "speed": 0.0,
            "mileage": 95000,
            "current_location_lat": 52.4800,
            "current_location_lng": 13.3550,
            "next_tuv": parse_date("2025-11-08"),
            "last_oil_change": 85000,
            "last_brake_change": 87000,
            "last_filter_change": 89000,
            "last_timing_belt_change": 60000,
            "last_clutch_change": 50000,
            "last_battery_change": 80000,
            "last_tires_change": 82000,
            "last_shock_absorbers_change": 75000
        },
        {
            "device_id": "eqb3412",
            "name": "Proace",
            "year": 2020,
            "plate_number": "B-EQB3412",
            "driver_name": "Felix Bauer",
            "status": "online",
            "speed": 0.0,
            "mileage": 35000,
            "current_location_lat": 52.4500,
            "current_location_lng": 13.5050,
            "next_tuv": parse_date("2026-11-09"),
            "last_oil_change": 25000,
            "last_brake_change": 27000,
            "last_filter_change": 29000,
            "last_timing_belt_change": 20000,
            "last_clutch_change": 15000,
            "last_battery_change": 25000,
            "last_tires_change": 27000,
            "last_shock_absorbers_change": 22000
        },
        {
            "device_id": "eqy844",
            "name": "Transit",
            "year": 2013,
            "plate_number": "B-EQY844",
            "driver_name": "David Fischer",
            "status": "online",
            "speed": 0.0,
            "mileage": 110000,
            "current_location_lat": 52.5100,
            "current_location_lng": 13.4550,
            "last_oil_change": 100000,
            "last_brake_change": 105000,
            "last_filter_change": 107000,
            "last_timing_belt_change": 80000,
            "last_clutch_change": 70000,
            "last_battery_change": 95000,
            "last_tires_change": 97000,
            "last_shock_absorbers_change": 90000
        },
        {
            "device_id": "eqw1056",
            "name": "Proace",
            "year": 2018,
            "plate_number": "B-EQW1056",
            "driver_name": "Martin Schulz",
            "status": "online",
            "speed": 0.0,
            "mileage": 65000,
            "current_location_lat": 52.4900,
            "current_location_lng": 13.3850,
            "next_tuv": parse_date("2025-01-02"),
            "last_oil_change": 55000,
            "last_brake_change": 57000,
            "last_filter_change": 59000,
            "last_timing_belt_change": 40000,
            "last_clutch_change": 30000,
            "last_battery_change": 50000,
            "last_tires_change": 52000,
            "last_shock_absorbers_change": 45000
        },
        {
            "device_id": "eqv4678",
            "name": "Proace",
            "year": 2018,
            "plate_number": "B-EQV4678",
            "driver_name": "Robert Koch",
            "status": "online",
            "speed": 0.0,
            "mileage": 70000,
            "current_location_lat": 52.5300,
            "current_location_lng": 13.4150,
            "next_tuv": parse_date("2026-01-22"),
            "last_oil_change": 60000,
            "last_brake_change": 62000,
            "last_filter_change": 64000,
            "last_timing_belt_change": 45000,
            "last_clutch_change": 35000,
            "last_battery_change": 55000,
            "last_tires_change": 57000,
            "last_shock_absorbers_change": 50000
        },
        {
            "device_id": "eqv5775",
            "name": "Transit",
            "year": 2008,
            "plate_number": "B-EQV5775",
            "driver_name": "Peter Meyer",
            "status": "online",
            "speed": 0.0,
            "mileage": 180000,
            "current_location_lat": 52.4700,
            "current_location_lng": 13.4250,
            "next_tuv": parse_date("2025-08-16"),
            "last_oil_change": 170000,
            "last_brake_change": 175000,
            "last_filter_change": 177000,
            "last_timing_belt_change": 150000,
            "last_clutch_change": 140000,
            "last_battery_change": 165000,
            "last_tires_change": 167000,
            "last_shock_absorbers_change": 160000
        },
        {
            "device_id": "eqb3411",
            "name": "Proace",
            "year": 2020,
            "plate_number": "B-EQB3411",
            "driver_name": "Andreas Wolf",
            "status": "online",
            "speed": 0.0,
            "mileage": 32000,
            "current_location_lat": 52.5000,
            "current_location_lng": 13.4350,
            "next_tuv": parse_date("2026-08-29"),
            "last_oil_change": 20000,
            "last_brake_change": 22000,
            "last_filter_change": 24000,
            "last_timing_belt_change": 15000,
            "last_clutch_change": 10000,
            "last_battery_change": 18000,
            "last_tires_change": 19000,
            "last_shock_absorbers_change": 17000
        }
    ]

    print("Adding test vehicles...")
    for data in vehicles_data:
        vehicle = Vehicle(**data)
        db.add(vehicle)
        print(f"Added vehicle: {vehicle.device_id}")

    db.commit()

    # Проверяем, что машины добавились
    vehicles = db.query(Vehicle).all()
    print("\nVehicles in database:")
    for v in vehicles:
        print(f"- {v.device_id}: {v.name}")
        
    print("\nTest data initialized successfully")
    db.close()

if __name__ == "__main__":
    init_db()
    seed_parts() 