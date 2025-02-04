from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
import json

# Таблица для связи many-to-many между запчастями и машинами
vehicle_parts = Table(
    'vehicle_parts',
    Base.metadata,
    Column('vehicle_id', Integer, ForeignKey('vehicles.id')),
    Column('part_id', Integer, ForeignKey('parts.id')),
    extend_existing=True
)

class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True)
    name = Column(String)
    year = Column(Integer)
    plate_number = Column(String)
    driver_name = Column(String)
    status = Column(String, default="offline")
    speed = Column(Float, default=0)
    mileage = Column(Float, default=0)
    current_location_lat = Column(Float)
    current_location_lng = Column(Float)
    last_update = Column(DateTime)
    next_tuv = Column(DateTime, nullable=True)
    
    # Добавляем новые поля для обслуживания
    last_oil_change = Column(Float, default=0)
    next_oil_change = Column(Float, default=10000)
    
    last_brake_change = Column(Float, default=0)
    next_brake_change = Column(Float, default=20000)
    
    last_timing_belt_change = Column(Float, default=0)
    next_timing_belt_change = Column(Float, default=60000)
    
    last_filter_change = Column(Float, default=0)
    next_filter_change = Column(Float, default=15000)
    
    last_clutch_change = Column(Float, default=0)
    next_clutch_change = Column(Float, default=80000)
    
    last_battery_change = Column(Float, default=0)
    next_battery_change = Column(Float, default=40000)
    
    last_tires_change = Column(Float, default=0)
    next_tires_change = Column(Float, default=30000)
    
    last_shock_absorbers_change = Column(Float, default=0)
    next_shock_absorbers_change = Column(Float, default=50000)

    daily_mileage = Column(Float, default=0)  # Добавляем поле для дневного пробега

    # Убираем неиспользуемые поля
    service_history = relationship("ServiceRecord", back_populates="vehicle")
    location_history = relationship("LocationHistory", back_populates="vehicle")

class Part(Base):
    __tablename__ = "parts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    min_quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    location = Column(String, nullable=True)  # Добавляем поле location
    compatible_vehicles = Column(JSON, default=list)  # Хранит список device_ids как JSON

class ServiceRecord(Base):
    __tablename__ = "service_records"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'))
    date = Column(DateTime, default=datetime.utcnow)
    type = Column(String)
    mileage = Column(Integer)
    description = Column(String)
    cost = Column(Float)
    
    vehicle = relationship("Vehicle", back_populates="service_history")

class LocationHistory(Base):
    __tablename__ = "location_history"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'))
    lat = Column(Float)
    lng = Column(Float)
    speed = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    vehicle = relationship("Vehicle", back_populates="location_history")

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
