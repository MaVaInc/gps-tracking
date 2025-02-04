from machine import UART, Pin
import time
import json
import struct
import network
import urequests
import _thread
import gc

# Настройка GPIO
RELAY_PIN = Pin(16, Pin.OUT)  # Пин для реле
LED = Pin("LED", Pin.OUT)     # Встроенный LED для индикации

# Настройка GPS модуля
gps_uart = UART(1, baudrate=9600, tx=Pin(4), rx=Pin(5))

# Настройка WiFi
WIFI_SSID = "your_ssid"
WIFI_PASS = "your_password"
SERVER_URL = "http://your_server:8001"

# Глобальные переменные
last_position = {"lat": 0, "lng": 0, "speed": 0}
last_send_time = 0
device_enabled = True
MIN_DISTANCE = 0.0001  # Минимальное изменение координат для отправки
MIN_SEND_INTERVAL = 5  # Минимальный интервал между отправками в секундах

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('Connecting to WiFi...')
        wlan.connect(WIFI_SSID, WIFI_PASS)
        while not wlan.isconnected():
            time.sleep(1)
    print('WiFi connected')
    return wlan

def parse_gps(line):
    """Парсинг NMEA данных"""
    try:
        if b"GPRMC" in line:
            data = line.decode().split(',')
            if data[2] == 'A':  # Данные валидны
                lat = float(data[3][:2]) + float(data[3][2:]) / 60
                lng = float(data[5][:3]) + float(data[5][3:]) / 60
                speed = float(data[7]) * 1.852  # Конвертация узлов в км/ч
                return lat, lng, speed
    except:
        pass
    return None

def calculate_distance(lat1, lon1, lat2, lon2):
    """Простой расчет расстояния между точками"""
    return ((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) ** 0.5

def send_data(lat, lng, speed):
    """Отправка данных в сжатом бинарном формате"""
    try:
        # Формируем бинарный пакет
        device_id = "B-EQW1054".ljust(16, '\0')  # Ваш ID устройства
        timestamp = time.time()
        
        packet = struct.pack(
            "16sddfI",
            device_id.encode(),
            lat,
            lng,
            speed,
            int(timestamp)
        )
        
        # Отправляем данные
        response = urequests.post(
            f"{SERVER_URL}/gps/binary_data",
            data=packet,
            headers={'Content-Type': 'application/octet-stream'}
        )
        LED.toggle()  # Индикация отправки
        response.close()
        gc.collect()  # Очистка памяти
    except Exception as e:
        print("Error sending data:", e)

def check_control_commands():
    """Проверка команд управления"""
    try:
        response = urequests.get(f"{SERVER_URL}/device/B-EQW1054/status")
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "disabled":
                RELAY_PIN.value(1)  # Отключаем двигатель
                global device_enabled
                device_enabled = False
            else:
                RELAY_PIN.value(0)  # Включаем двигатель
                device_enabled = True
        response.close()
        gc.collect()
    except:
        pass

def control_thread():
    """Отдельный поток для проверки команд управления"""
    while True:
        check_control_commands()
        time.sleep(5)

def main():
    wlan = connect_wifi()
    _thread.start_new_thread(control_thread, ())
    
    while True:
        if gps_uart.any():
            line = gps_uart.readline()
            gps_data = parse_gps(line)
            
            if gps_data:
                lat, lng, speed = gps_data
                current_time = time.time()
                
                # Проверяем, нужно ли отправлять обновление
                distance = calculate_distance(
                    last_position["lat"], 
                    last_position["lng"],
                    lat, 
                    lng
                )
                
                if (distance > MIN_DISTANCE or 
                    abs(speed - last_position["speed"]) > 5 or 
                    current_time - last_send_time > MIN_SEND_INTERVAL):
                    
                    send_data(lat, lng, speed)
                    last_position["lat"] = lat
                    last_position["lng"] = lng
                    last_position["speed"] = speed
                    last_send_time = current_time
        
        time.sleep(0.1)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Error:", e)
        machine.reset() 