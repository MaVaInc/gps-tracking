import socket
import struct
import threading
import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Добавляем путь к корневой директории проекта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import Base
from backend.models import Vehicle, Loca6666666666666666tionHistory

# Настройки UDP сервера
UDP_IP = "0.0.0.0"  # Слушаем на всех интерфейсах
UDP_PORT = 8888     # Порт для UDP
BUFFER_SIZE = 1024  # Увеличим буфер для JSON команд

# Настройка БД
SQLALCHEMY_DATABASE_URL = "sqlite:////var/www/gps/test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def process_gps_data(data: bytes, addr: tuple):
    """Обработка GPS данных от устройства"""
    try:
        device_id, lat, lon = struct.unpack("!16sdd", data)
        device_id = device_id.decode('utf-8').strip('\0')
        
        print(f"Получены GPS данные от {addr}:")
        print(f"device_id: {device_id}, lat: {lat}, lon: {lon}")
        
        db = SessionLocal()
        try:
            # Обновляем данные в БД
            vehicle = db.query(Vehicle).filter(Vehicle.device_id == device_id).first()
            if vehicle:
                vehicle.current_location_lat = lat
                vehicle.current_location_lng = lon
                vehicle.last_update = datetime.utcnow()
                vehicle.last_ip = addr[0]  # Сохраняем IP устройства
                db.commit()
                print(f"✅ Обновлена локация для {device_id}")
            else:
                print(f"❌ Устройство не найдено: {device_id}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Ошибка обработки GPS данных: {e}")

def process_control_command(data: bytes):
    """Обработка команды управления"""
    try:
        command = json.loads(data.decode())
        print(f"Получена команда: {command}")
        
        device_id = command.get('device_id')
        action = command.get('action')
        
        if device_id and action:
            db = SessionLocal()
            try:
                vehicle = db.query(Vehicle).filter(Vehicle.device_id == device_id).first()
                if vehicle:
                    if action == 'disable':
                        vehicle.status = 'disabled'
                    elif action == 'enable':
                        vehicle.status = 'online'
                    db.commit()
                    print(f"✅ Статус {device_id} обновлен на {action}")
            finally:
                db.close()
                
    except Exception as e:
        print(f"❌ Ошибка обработки команды: {e}")

def udp_server():
    """UDP сервер для приема данных и команд"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    print(f"🚀 UDP сервер запущен на {UDP_IP}:{UDP_PORT}")

    while True:
        try:
            data, addr = sock.recvfrom(BUFFER_SIZE)
            print(f"\n📩 Получены данные от {addr[0]}:{addr[1]}")
            
            # Если длина 32 байта - это GPS данные
            if len(data) == 32:
                process_gps_data(data, addr)
            # Иначе пробуем обработать как JSON команду
            else:
                process_control_command(data)
                
        except Exception as e:
            print(f"❌ Ошибка UDP сервера: {e}")

if __name__ == "__main__":
    print("🚀 Запуск UDP сервиса...")
    udp_server() 