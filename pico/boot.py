import machine
import time

# Настройка watchdog на случай зависания
wdt = machine.WDT(timeout=8000)  # 8 секунд

def do_connect():
    import network
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('Connecting to WiFi...')
        wlan.connect('your_ssid', 'your_password')
        for _ in range(10):  # Ждем подключения
            if wlan.isconnected():
                break
            time.sleep(1)
    print('Network config:', wlan.ifconfig())

# Запускаем основной скрипт
try:
    do_connect()
    import main
except Exception as e:
    print("Boot error:", e)
    machine.reset() 