import socket
import struct
import threading
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Vehicle, LocationHistory
from tracker_protocol import unpack_packet

# Конфигурация
HOST = '0.0.0.0'
PORT = 8001
DB_URL = "sqlite:///./test.db"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

def handle_client(client_socket: socket.socket):
    """Обработка подключения от трекера"""
    try:
        while True:
            # Читаем длину пакета (2 байта)
            length_data = client_socket.recv(2)
            if not length_data:
                break
                
            length = struct.unpack('!H', length_data)[0]
            
            # Читаем сам пакет
            data = client_socket.recv(length)
            if not data:
                break
                
            # Обрабатываем пакет
            packet = unpack_packet(data)
            process_packet(packet)
            
    except Exception as e:
        print(f"Error handling client: {e}")
    finally:
        client_socket.close()

def process_packet(packet: dict):
    """Обработка распакованного пакета"""
    db = SessionLocal()
    try:
        if packet['type'] == 'location':
            handle_location_packet(db, packet['device_id'], packet['latitude'], packet['longitude'], packet['speed'])
            
        elif packet['type'] == 'status':
            handle_status_packet(db, packet['device_id'], packet['enabled'])
            
        db.commit()
        print(f"Processed {packet['type']} update for {packet['device_id']}")
        
    except Exception as e:
        print(f"Error processing packet: {e}")
        db.rollback()
    finally:
        db.close()

def handle_location_packet(session, device_id: str, lat: float, lng: float, speed: float):
    """Обрабатываем пакет с локацией"""
    # Ищем машину по частичному совпадению device_id
    vehicle = session.query(Vehicle).filter(Vehicle.device_id.like(f'%{device_id}%')).first()
    if vehicle:
        # Обновляем позицию и скорость
        vehicle.current_location_lat = lat
        vehicle.current_location_lng = lng
        vehicle.speed = speed
        vehicle.last_update = datetime.now()
        
        # Обновляем дневной пробег
        if vehicle.daily_mileage is None:
            vehicle.daily_mileage = 0
        # Примерный расчет пройденного расстояния
        distance = speed * (5/3600)  # km за 5 секунд
        vehicle.daily_mileage += distance
        vehicle.mileage += distance
        
        session.commit()
    else:
        print(f"Vehicle not found for device_id containing: {device_id}")

def handle_status_packet(session, device_id: str, enabled: bool):
    """Обрабатываем пакет со статусом"""
    # Ищем машину по частичному совпадению device_id
    vehicle = session.query(Vehicle).filter(Vehicle.device_id.like(f'%{device_id}%')).first()
    if vehicle:
        vehicle.status = 'online' if enabled else 'disabled'
        vehicle.last_update = datetime.now()
        session.commit()
    else:
        print(f"Vehicle not found for device_id containing: {device_id}")

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen(5)
    
    print(f"Analytics service listening on {HOST}:{PORT}")
    
    try:
        while True:
            client, addr = server.accept()
            print(f"Accepted connection from {addr}")
            
            # Запускаем обработку клиента в отдельном потоке
            client_thread = threading.Thread(target=handle_client, args=(client,))
            client_thread.daemon = True
            client_thread.start()
            
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        server.close()

if __name__ == "__main__":
    main() 