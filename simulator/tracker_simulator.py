import random
import math
import time
import requests
import struct
import zlib
from datetime import datetime, timedelta

# Конфигурация
API_URL = 'http://94.156.114.240:8000'  # Используем IP вместо домена

class Vehicle:
    def __init__(self, id: int, device_id: str, lat: float, lng: float):
        self.id = id
        self.device_id = device_id
        self.current_lat = lat
        self.current_lng = lng
        self.direction = random.uniform(0, 2 * math.pi)
        self.enabled = True
        self.last_history_save = datetime.now()

    def should_save_history(self) -> bool:
        """Проверяем, нужно ли сохранять точку в историю"""
        now = datetime.now()
        # Сохраняем каждые 5 минут
        return (now - self.last_history_save) >= timedelta(minutes=5)

    def update_last_save(self):
        self.last_history_save = datetime.now()

VEHICLES = [
    Vehicle(1, "eqw1054", 52.52, 13.405),
    Vehicle(2, "eqe2152", 52.51, 13.402)
]

def pack_gps_data(device_id: str, lat: float, lng: float, speed: float, timestamp: int, save_history: bool) -> bytes:
    """Упаковываем GPS данные в бинарный формат"""
    # Добавляем флаг save_history как uint8 (1 байт)
    binary_data = struct.pack("16sddfI?", 
        device_id.encode(),  # 16 байт для ID
        lat,                # 8 байт для широты
        lng,                # 8 байт для долготы
        speed,             # 4 байта для скорости
        timestamp,         # 4 байта для времени
        save_history       # 1 байт для флага сохранения
    )
    return zlib.compress(binary_data)

def update_position(vehicle: Vehicle):
    if not vehicle.enabled:
        return

    # Случайное изменение направления
    vehicle.direction += random.uniform(-0.1, 0.1)
    
    # Случайная скорость от 0 до 60 км/ч
    speed = random.uniform(0, 60)
    
    # Конвертируем скорость в градусы/сек
    speed_deg = speed * 0.00001
    
    # Обновляем позицию
    vehicle.current_lat += math.sin(vehicle.direction) * speed_deg
    vehicle.current_lng += math.cos(vehicle.direction) * speed_deg
    
    # Получаем текущее время
    timestamp = int(datetime.now().timestamp())
    
    # Упаковываем данные
    binary_data = pack_gps_data(
        vehicle.device_id,
        vehicle.current_lat,
        vehicle.current_lng,
        speed,
        timestamp,
        save_history=vehicle.should_save_history()  # Добавляем флаг сохранения
    )
    
    try:
        print(f"""
Отправка данных для {vehicle.device_id}:
- Позиция: {vehicle.current_lat}, {vehicle.current_lng}
- Скорость: {speed}
- Timestamp: {timestamp}
- Save to history: {vehicle.should_save_history()}
        """)
        
        response = requests.post(
            f'{API_URL}/gps/binary_data',
            data=binary_data,
            headers={'Content-Type': 'application/octet-stream'}
        )
        
        if response.status_code == 200 and vehicle.should_save_history():
            vehicle.update_last_save()
            
        print(f"Location sent for {vehicle.device_id}: {response.status_code}")
        
    except Exception as e:
        print(f"Error sending location for {vehicle.device_id}: {e}")

def check_server():
    try:
        response = requests.get(f'{API_URL}/health')
        if response.status_code == 200:
            print(f"Server is available at {API_URL}")
            return True
    except Exception as e:
        print(f"Server is not available: {e}")
        return False

def main():
    print("Starting GPS tracker simulator...")
    print(f"Connecting to server at: {API_URL}")
    
    # Проверяем доступность сервера
    if not check_server():
        print("Cannot connect to server. Please check the server address and try again.")
        return
    
    try:
        while True:
            # Обновляем позиции всех машин
            for vehicle in VEHICLES:
                try:
                    update_position(vehicle)
                except Exception as e:
                    print(f"Error updating position for {vehicle.device_id}: {e}")
            
            # Ждем перед следующим обновлением
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nStopping simulator...")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main() 