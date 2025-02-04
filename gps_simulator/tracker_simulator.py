import asyncio
import struct
import zlib
import random
import time
import aiohttp
from datetime import datetime

# Фиксированные данные о машинах
VEHICLES = {
    "B-EQW1054": (51.1657, 10.4515),  # Proace
    "B-EQE2152": (52.5200, 13.4050),  # Transit
    "B-EFA1037": (52.3200, 13.2050),  # Transit
    "B-EQB8960": (51.9200, 13.3050),  # Transit
    "B-EQB3412": (52.4200, 13.5050),  # Proace
    "B-EQY844": (52.2200, 13.1050),   # Transit
    "B-EQW1056": (52.1200, 13.6050),  # Proace
}

async def send_gps_data(session, device_id: str, lat: float, lng: float, speed: float):
    """Отправляет GPS данные в бинарном формате"""
    try:
        timestamp = int(time.time())
        
        # Убираем префикс 'b-'
        device_id = device_id.replace('b-', '')
        
        # Форматируем device_id до 16 байт (теперь device_id длиннее из-за "B-" префикса)
        device_id_padded = device_id.lower().ljust(16, '\0')  # Приводим к нижнему регистру для совместимости
        
        # Упаковываем данные в бинарный формат
        packet = struct.pack(
            "16sddfI",  # формат: string(16), double, double, float, int
            device_id_padded.encode('utf-8'),  # device_id (16 bytes)
            lat,                               # latitude (8 bytes)
            lng,                               # longitude (8 bytes)
            speed,                             # speed (4 bytes)
            timestamp                          # timestamp (4 bytes)
        )
        
        # Сжимаем данные
        compressed_data = zlib.compress(packet)
        
        # Отправляем на аналитический сервис
        async with session.post(
            "http://localhost:8001/gps/binary_data",
            data=compressed_data,
            headers={"Content-Type": "application/octet-stream"}
        ) as response:
            if response.status != 200:
                print(f"Error sending data for {device_id}: {response.status}")
            else:
                print(f"Data sent for {device_id}")
    except Exception as e:
        print(f"Error sending data for {device_id}: {e}")

async def simulate_vehicle(session, device_id: str, start_lat: float, start_lng: float):
    """Симулирует движение одного транспортного средства"""
    lat, lng = start_lat, start_lng
    while True:
        # Более реалистичная симуляция скорости
        speed = random.uniform(0, 120) if random.random() > 0.3 else 0  # 30% шанс остановки
        
        # Небольшое случайное изменение координат если скорость не 0
        if speed > 0:
            lat += random.uniform(-0.001, 0.001)
            lng += random.uniform(-0.001, 0.001)
        
        await send_gps_data(session, device_id, lat, lng, speed)
        await asyncio.sleep(random.uniform(3, 8))  # Случайная задержка между обновлениями

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [
            simulate_vehicle(session, device_id, lat, lng)
            for device_id, (lat, lng) in VEHICLES.items()
        ]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    print("Starting GPS simulator...")
    asyncio.run(main()) 