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
        vehicle = db.query(Vehicle).filter(Vehicle.device_id == packet['device_id']).first()
        if not vehicle:
            print(f"Unknown device_id: {packet['device_id']}")
            return
            
        if packet['type'] == 'location':
            # Обновляем позицию и скорость
            vehicle.current_location_lat = packet['latitude']
            vehicle.current_location_lng = packet['longitude']
            vehicle.speed = packet['speed']
            vehicle.last_update = datetime.utcnow()
            
            # Сохраняем историю
            history = LocationHistory(
                vehicle_id=vehicle.id,
                lat=packet['latitude'],
                lng=packet['longitude'],
                speed=packet['speed'],
                timestamp=datetime.utcnow()
            )
            db.add(history)
            
        elif packet['type'] == 'status':
            vehicle.status = 'online' if packet['enabled'] else 'disabled'
            vehicle.last_update = datetime.utcnow()
            
        db.commit()
        print(f"Processed {packet['type']} update for {packet['device_id']}")
        
    except Exception as e:
        print(f"Error processing packet: {e}")
        db.rollback()
    finally:
        db.close()

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