from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Базовые схемы
class PartBase(BaseModel):
    name: str
    description: Optional[str] = ""
    quantity: int = 1
    price: float = 1.0
    location: Optional[str] = ""
    min_quantity: int = 1
    compatible_vehicles: List[int] = []

# Схемы для создания
class PartCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    quantity: int = 1
    min_quantity: int = 1
    price: float = 0.0
    compatible_vehicles: List[str] = []  # Список device_ids совместимых машин

# Схемы для обновления
class PartUpdate(PartBase):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    location: Optional[str] = None
    min_quantity: Optional[int] = None

# Схемы для чтения
class Part(PartCreate):
    id: int
    
    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    name: str
    year: int
    plate_number: str
    driver_name: str
    status: str
    speed: float = 0
    mileage: int = 0
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    last_update: datetime = None
    last_oil_change: Optional[int] = None
    last_brake_change: Optional[int] = None
    last_timing_belt_change: Optional[int] = None
    last_filter_change: Optional[int] = None
    next_oil_change: Optional[int] = None
    next_brake_change: Optional[int] = None
    next_timing_belt_change: Optional[int] = None
    next_filter_change: Optional[int] = None
    next_tuv: Optional[datetime] = None

# Схемы для создания
class VehicleCreate(VehicleBase):
    pass

# Схемы для чтения
class Vehicle(VehicleBase):
    id: int
    parts: List[Part] = []

    class Config:
        from_attributes = True

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    year: Optional[int] = None
    plate_number: Optional[str] = None
    driver_name: Optional[str] = None
    status: Optional[str] = None
    mileage: Optional[int] = None
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    
    # Поля last_*_change
    last_oil_change: Optional[int] = None
    last_brake_change: Optional[int] = None
    last_filter_change: Optional[int] = None
    last_timing_belt_change: Optional[int] = None
    last_clutch_change: Optional[int] = None
    last_battery_change: Optional[int] = None
    last_tires_change: Optional[int] = None
    last_shock_absorbers_change: Optional[int] = None
    
    # Поля next_*_change
    next_oil_change: Optional[int] = None
    next_brake_change: Optional[int] = None
    next_filter_change: Optional[int] = None
    next_timing_belt_change: Optional[int] = None
    next_clutch_change: Optional[int] = None
    next_battery_change: Optional[int] = None
    next_tires_change: Optional[int] = None
    next_shock_absorbers_change: Optional[int] = None

    class Config:
        from_attributes = True

class VehicleResponse(BaseModel):
    id: int
    device_id: str
    name: str
    year: int
    plate_number: str
    driver_name: str
    status: str
    speed: float
    mileage: int
    daily_mileage: int
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    last_update: Optional[datetime] = None
    
    # Поля для обслуживания
    last_oil_change: Optional[int] = None
    next_oil_change: Optional[int] = None
    last_brake_change: Optional[int] = None
    next_brake_change: Optional[int] = None
    last_filter_change: Optional[int] = None
    next_filter_change: Optional[int] = None
    last_timing_belt_change: Optional[int] = None
    next_timing_belt_change: Optional[int] = None
    last_clutch_change: Optional[int] = None
    next_clutch_change: Optional[int] = None
    last_battery_change: Optional[int] = None
    next_battery_change: Optional[int] = None
    last_tires_change: Optional[int] = None
    next_tires_change: Optional[int] = None
    last_shock_absorbers_change: Optional[int] = None
    next_shock_absorbers_change: Optional[int] = None
    
    # Интервалы обслуживания
    oil_change_interval: int = 10000
    brake_change_interval: int = 20000
    filter_change_interval: int = 15000
    timing_belt_interval: int = 60000
    clutch_interval: int = 80000
    battery_interval: int = 40000
    tires_interval: int = 30000
    shock_absorbers_interval: int = 50000

    class Config:
        from_attributes = True 