import socket
import time
import random
import math
import struct
from datetime import datetime
from tracker_protocol import pack_location, pack_status

# Конфигурация
ANALYTICS_HOST = '94.156.114.240'  # IP сервера
ANALYTICS_PORT = 8001  # Порт аналитического сервиса

VEHICLES = [
    {
        "id": 1,
        "device_id": "eqw1054",
        "current_lat": 52.52,
        "current_lng": 13.405,
        "direction": random.uniform(0, 2 * math.pi),
        "enabled": True
    },
    {
        "id": 2,
        "device_id": "eqe2152",
        "current_lat": 52.51,
        "current_lng": 13.402,
        "direction": random.uniform(0, 2 * math.pi),
        "enabled": True
    }
]

def send_packet(sock: socket.socket, data: bytes):
    """Отправляем пакет с длиной впереди"""
    length = len(data)
    sock.send(struct.pack('!H', length) + data)

def update_position(sock: socket.socket, vehicle: dict):
    if not vehicle["enabled"]:
        return

    # Случайное изменение направления
    vehicle["direction"] += random.uniform(-0.1, 0.1)
    
    # Случайная скорость от 0 до 60 км/ч
    speed = random.uniform(0, 60)
    
    # Конвертируем скорость в градусы/сек
    speed_deg = speed * 0.00001
    
    # Обновляем позицию
    vehicle["current_lat"] += math.sin(vehicle["direction"]) * speed_deg
    vehicle["current_lng"] += math.cos(vehicle["direction"]) * speed_deg
    
    # Отправляем бинарные данные
    try:
        data = pack_location(
            vehicle["device_id"],
            vehicle["current_lat"],
            vehicle["current_lng"],
            speed
        )
        send_packet(sock, data)
        print(f"Location sent for {vehicle['device_id']}")
        
    except Exception as e:
        print(f"Error sending location for {vehicle['device_id']}: {e}")

def simulate_disconnect(sock: socket.socket):
    """Периодически симулируем отключение случайной машины"""
    for vehicle in VEHICLES:
        if random.random() < 0.01:  # 1% шанс отключения
            vehicle["enabled"] = not vehicle["enabled"]
            
            try:
                data = pack_status(vehicle["device_id"], vehicle["enabled"])
                send_packet(sock, data)
                print(f"Status update for {vehicle['device_id']}: {'online' if vehicle['enabled'] else 'disabled'}")
                
            except Exception as e:
                print(f"Error sending status for {vehicle['device_id']}: {e}")

def main():
    print("Starting GPS tracker simulator...")
    
    # Создаем TCP соединение
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((ANALYTICS_HOST, ANALYTICS_PORT))
    
    try:
        while True:
            # Обновляем позиции всех машин
            for vehicle in VEHICLES:
                update_position(sock, vehicle)
            
            # Симулируем возможные отключения
            simulate_disconnect(sock)
            
            # Ждем перед следующим обновлением
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nStopping simulator...")
    finally:
        sock.close()

if __name__ == "__main__":
    main() 