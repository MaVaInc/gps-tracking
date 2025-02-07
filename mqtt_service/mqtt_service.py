import paho.mqtt.client as mqtt
import struct
import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
import logging

# Добавляем путь к корневой директории проекта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import Base
from backend.models import Vehicle, LocationHistory

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Настройки MQTT
MQTT_BROKER = "localhost"  # Или IP вашего MQTT брокера
MQTT_PORT = 1883
MQTT_TOPIC_GPS = "gps/+/location"  # + будет заменен на device_id
MQTT_TOPIC_CONTROL = "gps/+/control"
MQTT_USERNAME = "gps_user"
MQTT_PASSWORD = "Mavaincee2020"  # Те же данные что и в клиенте

# Настройка БД
SQLALCHEMY_DATABASE_URL = "sqlite:////var/www/gps/test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def process_gps_data(device_id: str, payload: bytes):
    """Обработка GPS данных от устройства"""
    try:
        logger.info("=" * 50)
        logger.info(f"Начало обработки GPS данных")
        logger.info(f"Device ID: {device_id}")
        logger.info(f"Размер данных: {len(payload)} байт")
        
        # Распаковываем бинарные данные (включая acc)
        lat, lon, speed, acc = struct.unpack("!ddfi", payload)
        
        # Конвертируем acc в boolean
        acc_state = bool(acc)
        
        logger.info(f"Распакованные данные:")
        logger.info(f"- Широта: {lat}")
        logger.info(f"- Долгота: {lon}")
        logger.info(f"- Скорость: {speed} км/ч")
        logger.info(f"- ACC: {'ВКЛ' if acc_state else 'ВЫКЛ'}")
        
        db = SessionLocal()
        try:
            logger.info("Поиск устройства в БД...")
            vehicle = db.query(Vehicle).filter(Vehicle.device_id == device_id).first()
            
            if vehicle:
                logger.info(f"Найдено устройство: {vehicle.name} (ID: {vehicle.id})")
                logger.info("Обновление данных...")
                
                # Сохраняем старые значения для лога
                old_lat = vehicle.current_location_lat
                old_lon = vehicle.current_location_lng
                old_speed = vehicle.speed
                old_acc = vehicle.acc
                
                # Обновляем данные
                vehicle.current_location_lat = lat
                vehicle.current_location_lng = lon
                vehicle.speed = speed
                vehicle.acc = acc_state
                vehicle.last_update = datetime.utcnow()
                
                # Статус зависит от ACC
                vehicle.status = 'online' if acc_state else 'offline'
                
                logger.info("Изменения:")
                logger.info(f"- Позиция: {old_lat},{old_lon} -> {lat},{lon}")
                logger.info(f"- Скорость: {old_speed} -> {speed}")
                logger.info(f"- ACC: {old_acc} -> {acc_state}")
                logger.info(f"- Статус: {vehicle.status}")
                
                # Сохраняем в историю
                history = LocationHistory(
                    vehicle_id=vehicle.id,
                    lat=lat,
                    lng=lon,
                    speed=speed,
                    acc=acc_state,
                    timestamp=datetime.utcnow()
                )
                db.add(history)
                logger.info("Добавлена запись в историю")
                
                db.commit()
                logger.info("✅ Данные успешно сохранены")
            else:
                logger.warning(f"❌ Устройство не найдено: {device_id}")
                logger.warning("Доступные устройства:")
                vehicles = db.query(Vehicle).all()
                for v in vehicles:
                    logger.warning(f"- {v.device_id}: {v.name}")
        finally:
            db.close()
            logger.info("Соединение с БД закрыто")
            
    except Exception as e:
        logger.error(f"❌ Ошибка обработки GPS данных: {e}")
        logger.exception("Полный стек ошибки:")

def process_control_command(device_id: str, payload: str):
    """Обработка команды управления"""
    try:
        logger.info("=" * 50)
        logger.info(f"Получена команда управления")
        logger.info(f"Device ID: {device_id}")
        logger.info(f"Payload: {payload}")
        
        command = json.loads(payload)
        action = command.get('action')
        logger.info(f"Команда: {action}")
        
        if action:
            db = SessionLocal()
            try:
                logger.info("Поиск устройства в БД...")
                vehicle = db.query(Vehicle).filter(Vehicle.device_id == device_id).first()
                
                if vehicle:
                    logger.info(f"Найдено устройство: {vehicle.name}")
                    logger.info(f"Текущий статус: {vehicle.status}")
                    logger.info(f"Текущее состояние ACC: {vehicle.acc}")
                    
                    if action == 'disable':
                        vehicle.status = 'disabled'
                        vehicle.acc = False
                        logger.info("Отключение устройства и ACC...")
                    elif action == 'enable':
                        vehicle.status = 'online'
                        vehicle.acc = True
                        logger.info("Включение устройства и ACC...")
                        
                    db.commit()
                    logger.info(f"✅ Статус обновлен на: {vehicle.status}")
                    logger.info(f"✅ ACC: {'ВКЛ' if vehicle.acc else 'ВЫКЛ'}")
                    
                    # Отправляем подтверждение
                    response_topic = f"gps/{device_id}/control/response"
                    response_payload = {
                        "status": "success",
                        "action": action,
                        "acc": vehicle.acc,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    logger.info(f"Отправка подтверждения в топик: {response_topic}")
                    logger.info(f"Payload: {response_payload}")
                    
                    client.publish(response_topic, json.dumps(response_payload))
                    logger.info("✅ Подтверждение отправлено")
            finally:
                db.close()
                logger.info("Соединение с БД закрыто")
                
    except Exception as e:
        logger.error(f"❌ Ошибка обработки команды: {e}")
        logger.exception("Полный стек ошибки:")

def on_connect(client, userdata, flags, rc):
    """Callback при подключении к брокеру"""
    if rc == 0:
        logger.info("✅ Подключено к MQTT брокеру")
        # Подписываемся на топики
        client.subscribe(MQTT_TOPIC_GPS)
        client.subscribe(MQTT_TOPIC_CONTROL)
    else:
        logger.error(f"❌ Ошибка подключения к MQTT брокеру: {rc}")

def on_message(client, userdata, msg):
    """Callback при получении сообщения"""
    try:
        # Извлекаем device_id из топика
        topic_parts = msg.topic.split('/')
        if len(topic_parts) < 3:
            return
        
        device_id = topic_parts[1]
        
        # Определяем тип сообщения по топику
        if 'location' in msg.topic:
            process_gps_data(device_id, msg.payload)
        elif 'control' in msg.topic:
            process_control_command(device_id, msg.payload.decode())
            
    except Exception as e:
        logger.error(f"❌ Ошибка обработки сообщения: {e}")

def main():
    """Основная функция"""
    client = mqtt.Client()
    
    # Устанавливаем callbacks
    client.on_connect = on_connect
    client.on_message = on_message
    
    # Добавляем аутентификацию
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    
    try:
        # Подключаемся к брокеру
        logger.info(f"🚀 Подключение к MQTT брокеру {MQTT_BROKER}:{MQTT_PORT}")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Запускаем цикл обработки сообщений
        client.loop_forever()
        
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    logger.info("🚀 Запуск MQTT сервиса...")
    main() 