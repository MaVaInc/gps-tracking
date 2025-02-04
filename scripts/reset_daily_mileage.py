from datetime import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Vehicle

def reset_daily_mileage():
    db = SessionLocal()
    try:
        vehicles = db.query(Vehicle).all()
        for vehicle in vehicles:
            vehicle.daily_mileage = 0
        db.commit()
        print(f"[{datetime.now()}] Daily mileage reset successful")
    except Exception as e:
        print(f"[{datetime.now()}] Error resetting daily mileage: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_daily_mileage() 