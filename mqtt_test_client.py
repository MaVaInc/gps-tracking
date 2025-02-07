import paho.mqtt.client as mqtt
import struct
import time
import random
import logging
import json
from datetime import datetime

# Настройка логирования для отладки
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Настройки подключения к MQTT брокеру на сервере
MQTT_BROKER = "94.156.114.240"  # IP вашего сервера
MQTT_PORT = 1883
MQTT_USER = "gps_user"
MQTT_PASSWORD = "Mavaincee2020"

# Данные тестового устройства
DEVICE_ID = "eqw1054"          # ID устройства в базе данных
INITIAL_LAT = 52.52            # Начальная широта
INITIAL_LON = 13.405          # Начальная долгота

# Состояние устройства
acc_state = False  # Состояние ACC (False = выключено, True = включено)

def on_connect(client, userdata, flags, rc):
    """
    Функция вызывается при подключении к брокеру
    rc = 0: успешное подключение
    rc = 5: ошибка авторизации
    """
    if rc == 0:
        logger.info("✅ Подключено к MQTT брокеру")
        # Подписываемся на команды управления
        control_topic = f"gps/{DEVICE_ID}/control"
        client.subscribe(control_topic)
        logger.info(f"Подписка на топик: {control_topic}")
    else:
        logger.error(f"❌ Ошибка подключения: {rc}")

def on_message(client, userdata, msg):
    """
    Обработка входящих сообщений от сервера
    Здесь мы получаем команды включения/выключения ACC
    """
    global acc_state
    
    try:
        command = json.loads(msg.payload.decode())
        action = command.get('action')
        
        logger.info(f"📥 Получена команда: {action}")
        
        if action == 'enable':
            acc_state = True
            logger.info("🔑 ACC ВКЛЮЧЕНО")
        elif action == 'disable':
            acc_state = False
            logger.info("🔑 ACC ВЫКЛЮЧЕНО")
            
        response = {
            'status': 'success',
            'action': action,
            'acc': acc_state,
            'timestamp': datetime.utcnow().isoformat()
        }
        response_topic = f"gps/{DEVICE_ID}/control/response"
        client.publish(response_topic, json.dumps(response))
        
    except Exception as e:
        logger.error(f"❌ Ошибка обработки команды: {e}")

def send_gps_data(client):
    """
    Отправка GPS данных и состояния зажигания на сервер
    """
    try:
        # Генерируем новые координаты (имитация движения)
        lat = INITIAL_LAT + random.uniform(-0.001, 0.001)  # ±~100 метров
        lon = INITIAL_LON + random.uniform(-0.001, 0.001)
        
        # Если ACC выключено - скорость 0
        speed = random.uniform(0, 60) if acc_state else 0.0

        # Упаковываем данные в бинарный формат
        # !ddfi - формат:
        # d - double (8 байт) для широты
        # d - double (8 байт) для долготы
        # f - float (4 байта) для скорости
        # i - int (4 байта) для состояния ACC (0/1)
        payload = struct.pack("!ddfi", lat, lon, speed, int(acc_state))

        # Формируем топик для отправки
        topic = f"gps/{DEVICE_ID}/location"

        # Отправляем данные
        client.publish(topic, payload)

        # Логируем отправленные данные
        logger.info(f"📍 Отправлены данные:")
        logger.info(f"Топик: {topic}")
        logger.info(f"Координаты: {lat}, {lon}")
        logger.info(f"Скорость: {speed:.1f} км/ч")
        logger.info(f"ACC: {'🔑 ВКЛ' if acc_state else '🔑 ВЫКЛ'}")
        logger.info("-" * 50)

    except Exception as e:
        logger.error(f"❌ Ошибка отправки: {e}")

def main():
    """
    Основная функция программы
    """
    # Создаем MQTT клиента
    client = mqtt.Client()
    
    # Устанавливаем обработчики событий
    client.on_connect = on_connect
    client.on_message = on_message
    
    # Устанавливаем логин и пароль для подключения к брокеру
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    
    try:
        # Подключаемся к брокеру
        logger.info(f"🚀 Подключение к {MQTT_BROKER}:{MQTT_PORT}")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Запускаем фоновый поток для обработки MQTT сообщений
        client.loop_start()

        # Бесконечный цикл отправки данных
        while True:
            send_gps_data(client)
            time.sleep(5)  # Пауза 5 секунд между отправками

    except KeyboardInterrupt:
        # Если нажали Ctrl+C
        logger.info("👋 Завершение работы...")
        client.loop_stop()
        client.disconnect()
    except Exception as e:
        logger.error(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    logger.info("🚀 Запуск тестового клиента...")
    main() 