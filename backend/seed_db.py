from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Vehicle, Part

def seed_db():
    print("Starting database seeding...")  # Добавляем логирование
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
                name="Toyota Proace",
                year=2020,
                plate_number="AA123BB",
                driver_name="Иван Иванов",
                status="online",
                speed=0,
                mileage=50000,
                current_location_lat=55.7558,
                current_location_lng=37.6173,
                last_update=datetime.utcnow(),
                next_tuv=datetime.utcnow() + timedelta(days=180)
            ),
            Vehicle(
                name="Ford Transit",
                year=2019,
                plate_number="BB456CC",
                driver_name="Петр Петров",
                status="offline",
                speed=0,
                mileage=75000,
                current_location_lat=59.9343,
                current_location_lng=30.3351,
                last_update=datetime.utcnow(),
                next_tuv=datetime.utcnow() + timedelta(days=90)
            ),
            # Добавьте другие машины по необходимости
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
    seed_db() 