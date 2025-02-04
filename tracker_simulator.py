import random
import math
import time
import requests
import struct
import zlib
from datetime import datetime

# Конфигурация
API_URL = 'http://localhost:8001'  # URL аналитического сервера

VEHICLES = [
    {
        "id": 1,
        "device_id": "b-eqw1054",  # добавляем префикс для совместимости
        "current_lat": 52.52,
        "current_lng": 13.405,
        "direction": random.uniform(0, 2 * math.pi),
        "enabled": True
    },
    {
        "id": 2,
        "device_id": "b-eqe2152",
        "current_lat": 52.51,
        "current_lng": 13.402,
        "direction": random.uniform(0, 2 * math.pi),
        "enabled": True
    }
]

def pack_gps_data(device_id: str, lat: float, lng: float, speed: float, timestamp: int) -> bytes:
    """Упаковываем GPS данные в бинарный формат"""
    # Формат: device_id (16 bytes), lat (double), lng (double), speed (float), timestamp (uint32)
    binary_data = struct.pack("16sddfI", 
        device_id.encode(), # 16 байт для ID
        lat,               # 8 байт для широты
        lng,               # 8 байт для долготы
        speed,            # 4 байта для скорости
        timestamp         # 4 байта для времени
    )
    # Сжимаем данные
    return zlib.compress(binary_data)

def update_position(vehicle: dict):
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
    
    # Получаем текущее время в Unix timestamp
    timestamp = int(datetime.now().timestamp())
    
    # Упаковываем данные в бинарный формат
    binary_data = pack_gps_data(
        vehicle['device_id'],
        vehicle['current_lat'],
        vehicle['current_lng'],
        speed,
        timestamp
    )
    
    # Отправляем бинарные данные
    try:
        print(f"""
Отправка данных для {vehicle['device_id']}:
- Позиция: {vehicle['current_lat']}, {vehicle['current_lng']}
- Скорость: {speed}
- Timestamp: {timestamp}
        """)
        
        response = requests.post(
            f'{API_URL}/gps/binary_data',
            data=binary_data,
            headers={'Content-Type': 'application/octet-stream'}
        )
        print(f"Location sent for {vehicle['device_id']}: {response.status_code}")
        if response.status_code != 200:
            print(f"Error response: {response.text}")
        
    except Exception as e:
        print(f"Error sending location for {vehicle['device_id']}: {e}")

def simulate_disconnect():
    """Периодически симулируем отключение случайной машины"""
    for vehicle in VEHICLES:
        if random.random() < 0.01:  # 1% шанс отключения
            vehicle["enabled"] = not vehicle["enabled"]
            
            try:
                response = requests.post(f'{API_URL}/status', json={
                    'device_id': vehicle['device_id'],
                    'enabled': vehicle['enabled']
                })
                print(f"Status update for {vehicle['device_id']}: {response.status_code}")
                
            except Exception as e:
                print(f"Error sending status for {vehicle['device_id']}: {e}")

def main():
    print("Starting GPS tracker simulator...")
    
    try:
        while True:
            # Обновляем позиции всех машин
            for vehicle in VEHICLES:
                update_position(vehicle)
            
            # Симулируем возможные отключения
            simulate_disconnect()
            
            # Ждем перед следующим обновлением
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nStopping simulator...")

if __name__ == "__main__":
    main() 