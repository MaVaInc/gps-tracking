from sqlalchemy.orm import Session
from . import models, schemas
from fastapi import HTTPException

def get_parts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Part).offset(skip).limit(limit).all()

def create_part(db: Session, part: schemas.PartCreate):
    db_part = models.Part(
        name=part.name,
        description=part.description,
        quantity=part.quantity,
        price=part.price,
        min_quantity=part.min_quantity,
        compatible_vehicles=part.compatible_vehicles
    )
    db.add(db_part)
    try:
        db.commit()
        db.refresh(db_part)
        return db_part
    except Exception as e:
        db.rollback()
        raise e

def update_part(db: Session, part_id: int, part: schemas.PartUpdate):
    db_part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if not db_part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    for key, value in part.dict(exclude_unset=True).items():
        setattr(db_part, key, value)
    
    db.commit()
    db.refresh(db_part)
    return db_part

def delete_part(db: Session, part_id: int):
    db_part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if not db_part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    db.delete(db_part)
    db.commit()

def get_vehicle(db: Session, vehicle_id: int):
    return db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()

def update_vehicle(db: Session, vehicle: models.Vehicle, vehicle_update: schemas.VehicleUpdate):
    update_data = vehicle_update.dict(exclude_unset=True)
    print(f"Updating vehicle with data: {update_data}")
    
    for key, value in update_data.items():
        setattr(vehicle, key, value)
        print(f"Setting {key} = {value}")
    
    try:
        db.commit()
        db.refresh(vehicle)
        return vehicle
    except Exception as e:
        db.rollback()
        print(f"Error updating vehicle: {e}")
        raise e 