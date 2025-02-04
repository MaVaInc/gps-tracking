import random
import math
import time
import requests
from datetime import datetime

# Конфигурация
API_URL = 'http://94.156.114.240:8001'  # URL аналитического сервера

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
    
    # Отправляем данные через API
    try:
        response = requests.post(f'{API_URL}/location', json={
            'device_id': vehicle['device_id'],
            'latitude': vehicle['current_lat'],
            'longitude': vehicle['current_lng'],
            'speed': speed
        })
        print(f"Location sent for {vehicle['device_id']}: {response.status_code}")
        
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