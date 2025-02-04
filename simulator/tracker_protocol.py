import struct
from enum import Enum

class PacketType(Enum):
    LOCATION = 1
    STATUS = 2

def pack_location(device_id: str, lat: float, lng: float, speed: float) -> bytes:
    """Упаковываем данные локации в бинарный формат:
    - 1 байт: тип пакета (1 = локация)
    - 8 байт: device_id (как строка фиксированной длины)
    - 8 байт: latitude (double)
    - 8 байт: longitude (double)
    - 4 байт: speed (float)
    """
    return struct.pack('!B8s3f', 
        PacketType.LOCATION.value,
        device_id.encode().ljust(8)[:8],
        lat,
        lng,
        speed
    )

def pack_status(device_id: str, enabled: bool) -> bytes:
    """Упаковываем статус в бинарный формат:
    - 1 байт: тип пакета (2 = статус)
    - 8 байт: device_id
    - 1 байт: статус (1 = включен, 0 = выключен)
    """
    return struct.pack('!B8s?',
        PacketType.STATUS.value,
        device_id.encode().ljust(8)[:8],
        enabled
    ) 