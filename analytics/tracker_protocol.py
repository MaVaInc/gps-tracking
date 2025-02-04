import struct
from enum import Enum

class PacketType(Enum):
    LOCATION = 1
    STATUS = 2

def pack_location(device_id: str, lat: float, lng: float, speed: float) -> bytes:
    """Упаковываем данные о местоположении в бинарный формат"""
    # Тип пакета: 1 - локация
    packet = bytearray([1])
    
    # ID устройства (8 байт, дополненных нулями)
    device_bytes = device_id.encode()
    packet.extend(device_bytes.ljust(8, b'\0'))
    
    # Координаты и скорость (3 float = 12 байт)
    packet.extend(struct.pack('!3f', lat, lng, speed))
    
    return bytes(packet)

def pack_status(device_id: str, enabled: bool) -> bytes:
    """Упаковываем данные о статусе в бинарный формат"""
    # Тип пакета: 2 - статус
    packet = bytearray([2])
    
    # ID устройства (8 байт, дополненных нулями)
    device_bytes = device_id.encode()
    packet.extend(device_bytes.ljust(8, b'\0'))
    
    # Статус (1 байт)
    packet.extend([1 if enabled else 0])
    
    return bytes(packet)

def unpack_packet(data: bytes) -> dict:
    """Распаковываем бинарные данные в словарь"""
    packet_type = struct.unpack('!B', data[0:1])[0]
    
    if packet_type == PacketType.LOCATION.value:
        device_id, lat, lng, speed = struct.unpack('!8s3f', data[1:])
        return {
            'type': 'location',
            'device_id': device_id.decode().rstrip('\x00'),
            'latitude': lat,
            'longitude': lng,
            'speed': speed
        }
    elif packet_type == PacketType.STATUS.value:
        device_id, enabled = struct.unpack('!8s?', data[1:])
        return {
            'type': 'status',
            'device_id': device_id.decode().rstrip('\x00'),
            'enabled': enabled
        }
    else:
        raise ValueError(f"Unknown packet type: {packet_type}") 