from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, Vehicle, Part

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже данные
        if db.query(Vehicle).count() > 0:
            print("Database already contains data, skipping seed")
            return

        # Создаем тестовые запчасти
        parts = [
            Part(
                name="Масляный фильтр",
                description="Фильтр для очистки масла",
                quantity=10,
                price=15.99,
                location="Склад A",
                min_quantity=3
            ),
            Part(
                name="Воздушный фильтр",
                description="Фильтр для очистки воздуха",
                quantity=8,
                price=25.99,
                location="Склад B",
                min_quantity=2
            ),
            # Добавьте другие запчасти по необходимости
        ]
        
        for part in parts:
            db.add(part)
        
        # Создаем тестовые машины
        vehicles = [
            Vehicle(
                name="Proace",
                device_id="eqw1054",
                driver_name="Hans Schmidt",
                plate_number="B-EQW1054",
                year=2018,
                status="disabled",
                mileage=120000,
                daily_mileage=0,
                speed=0,
                current_location_lat=52.52,
                current_location_lng=13.405,
                
                # Интервалы обслуживания
                oil_change_interval=10000,
                brake_change_interval=20000,
                timing_belt_interval=60000,
                filter_change_interval=15000,
                clutch_interval=80000,
                battery_interval=40000,
                tires_interval=30000,
                shock_absorbers_interval=50000,
                
                # Последние замены
                last_oil_change=115000,
                last_brake_change=115000,
                last_timing_belt_change=90000,
                last_filter_change=117000,
                last_clutch_change=80000,
                last_battery_change=100000,
                last_tires_change=105000,
                last_shock_absorbers_change=95000,
                
                # Следующие замены
                next_oil_change=125000,
                next_brake_change=135000,
                next_timing_belt_change=150000,
                next_filter_change=132000,
                next_clutch_change=160000,
                next_battery_change=140000,
                next_tires_change=135000,
                next_shock_absorbers_change=145000
            ),
            Vehicle(
                name="Transit",
                device_id="eqe2152",
                driver_name="Klaus Weber",
                plate_number="B-EQE2152",
                year=2019,
                status="online",
                mileage=80000,
                daily_mileage=0,
                speed=0,
                current_location_lat=52.51,
                current_location_lng=13.402,
                
                # Интервалы обслуживания
                oil_change_interval=10000,
                brake_change_interval=20000,
                timing_belt_interval=60000,
                filter_change_interval=15000,
                clutch_interval=80000,
                battery_interval=40000,
                tires_interval=30000,
                shock_absorbers_interval=50000,
                
                # Последние замены
                last_oil_change=75000,
                last_brake_change=70000,
                last_timing_belt_change=60000,
                last_filter_change=75000,
                last_clutch_change=0,
                last_battery_change=40000,
                last_tires_change=60000,
                last_shock_absorbers_change=50000,
                
                # Следующие замены
                next_oil_change=85000,
                next_brake_change=90000,
                next_timing_belt_change=120000,
                next_filter_change=90000,
                next_clutch_change=80000,
                next_battery_change=80000,
                next_tires_change=90000,
                next_shock_absorbers_change=100000
            )
        ]
        
        for vehicle in vehicles:
            db.add(vehicle)
        
        # Добавляем связи между запчастями и машинами
        vehicles[0].compatible_parts.extend([parts[0], parts[1]])
        vehicles[1].compatible_parts.extend([parts[0]])
        
        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 