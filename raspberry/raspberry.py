import machine
import utime
import struct
import _thread
import random

# Инициализация UART для GSM
gsm = machine.UART(1, 9600, tx=machine.Pin(8), rx=machine.Pin(9))

# Инициализация реле
relay = machine.Pin(2, machine.Pin.OUT)
relay.value(1)  # Включено по умолчанию

# Настройки
DEVICE_ID = "eqw1054"
SERVER_IP = "94.156.114.240"
SERVER_PORT = 8888

def send_at(command, wait=2, retries=3):
    """Отправка AT команды с повторами"""
    for attempt in range(retries):
        print(f"-> {command} (попытка {attempt + 1})")
        
        # Очищаем буфер перед отправкой
        while gsm.any():
            gsm.read()
            
        # Отправляем команду
        gsm.write((command + "\r\n").encode())
        utime.sleep(wait)  # Ждем ответ
        
        response = ""
        # Читаем весь ответ
        while gsm.any():
            try:
                chunk = gsm.read().decode('utf-8', 'ignore')
                response += chunk
            except:
                continue
                
        response = response.strip()
        print(f"<- {response}")
        
        if "OK" in response or "CONNECT OK" in response or "SEND OK" in response or "SHUT OK" in response:
            return response
            
        if "ERROR" in response:
            print(f"❌ Ошибка: {response}")
            utime.sleep(2)  # Увеличиваем задержку при ошибке
            continue
            
        print("⚠️ Нет нужного ответа")
        utime.sleep(1)
        
    return None

def init_gsm():
    """Инициализация GSM модуля"""
    print("🚀 Инициализация GSM модуля...")
    
    # Сброс модуля
    print("Сброс модуля...")
    utime.sleep(2)
    
    # Отключаем эхо сразу
    send_at("ATE0", wait=3)
    
    # Проверяем связь с модулем
    if not send_at("AT", wait=3):
        print("❌ Модуль не отвечает")
        return False
    
    # Ждем регистрации в сети
    for _ in range(10):  # Пробуем 10 раз
        response = send_at("AT+CREG?", wait=3)
        if response and ("+CREG: 0,1" in response or "+CREG: 0,5" in response):
            break
        print("⏳ Ожидание регистрации в сети...")
        utime.sleep(2)
    else:
        print("❌ Нет регистрации в сети")
        return False
    
    # Проверяем уровень сигнала
    response = send_at("AT+CSQ", wait=3)
    if not response or "+CSQ:" not in response:
        print("❌ Не удалось получить уровень сигнала")
        return False
        
    print("✅ GSM модуль инициализирован")
    return True

def setup_gprs():
    """Настройка GPRS соединения"""
    print("📡 Настройка GPRS...")
    
    # Закрываем все соединения
    send_at("AT+CIPSHUT", wait=5)
    
    # Устанавливаем режим одиночного соединения
    if not send_at("AT+CIPMUX=0"):
        return False
        
    # Проверяем прикрепление к GPRS
    response = send_at('AT+CGATT?')
    if not response or "+CGATT: 1" not in response:
        return False
        
    # Устанавливаем APN
    if not send_at('AT+CSTT="internet.lebara.de"'):
        return False
        
    # Устанавливаем соединение GPRS
    if not send_at('AT+CIICR', wait=5):
        return False
        
    # Получаем IP
    response = send_at('AT+CIFSR', wait=2)
    if not response or '.' not in response:
        return False
        
    print(f"✅ Получен IP: {response}")
    return True

def setup_udp():
    """Настройка UDP соединения"""
    print(f"🌐 Настройка UDP соединения с {SERVER_IP}:{SERVER_PORT}")
    
    # Закрываем предыдущее соединение если есть
    send_at('AT+CIPCLOSE', wait=1)
    
    # Открываем новое UDP соединение
    response = send_at(f'AT+CIPSTART="UDP","{SERVER_IP}","{SERVER_PORT}"', wait=5)
    if response and "CONNECT OK" in response:
        print("✅ UDP соединение установлено")
        return True
    
    print("❌ Ошибка UDP соединения")
    return False

def send_udp_data(lat, lon):
    """Отправка GPS данных"""
    try:
        data = struct.pack("!16sdd", 
            DEVICE_ID.ljust(16, '\0').encode(),
            float(lat),
            float(lon)
        )
        
        # Отправляем размер данных
        if not send_at(f'AT+CIPSEND={len(data)}', wait=1):
            return False
            
        # Отправляем данные
        gsm.write(data)
        utime.sleep(1)
        
        # Проверяем отправку
        response = send_at('AT+CIPSTATUS', wait=1)
        if response and "CONNECT OK" in response:
            print(f"✅ Отправлены координаты: {lat}, {lon}")
            return True
            
        return False
        
    except Exception as e:
        print(f"❌ Ошибка отправки: {e}")
        return False

def check_connection():
    """Проверка активности соединения"""
    response = send_at('AT+CIPSTATUS', wait=1)
    if response and "CONNECT OK" in response:
        return True
    return False

def listen_for_commands():
    """Прослушивание команд управления"""
    while True:
        try:
            response = send_at("AT+CIPRXGET=2,1")
            if response and '+CIPRXGET: 2,1,' in response:
                # Ищем команду в ответе
                if "disable" in response.lower():
                    relay.value(0)
                    print("⚠️ Реле отключено")
                elif "enable" in response.lower():
                    relay.value(1)
                    print("✅ Реле включено")
        except Exception as e:
            print(f"❌ Ошибка приема команд: {e}")
        utime.sleep(1)

# Запускаем прием команд в отдельном потоке
_thread.start_new_thread(listen_for_commands, ())

# Основной код
print("🔥 Запуск GPS трекера...")

# Инициализация
while not init_gsm():
    print("🔄 Повторная попытка через 5 секунд...")
    utime.sleep(5)

# Настройка GPRS
while not setup_gprs():
    print("🔄 Повторная попытка GPRS через 5 секунд...")
    utime.sleep(5)

# Настройка UDP
while not setup_udp():
    print("🔄 Повторная попытка UDP через 5 секунд...")
    utime.sleep(5)

print("✅ Система готова к работе!")

# Основной цикл
while True:
    try:
        # Проверяем соединение
        if not check_connection():
            print("🔄 Переподключение...")
            if not setup_gprs() or not setup_udp():
                continue
        
        # Генерируем координаты
        lat = round(48.0 + random.uniform(-0.5, 0.5), 6)
        lon = round(10.0 + random.uniform(-0.5, 0.5), 6)
        print(f"📍 Координаты: {lat}, {lon}")
        
        # Отправляем данные
        if not send_udp_data(lat, lon):
            print("❌ Ошибка отправки")
            continue
            
        print("✅ Данные отправлены")
        utime.sleep(5)
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        utime.sleep(5) 