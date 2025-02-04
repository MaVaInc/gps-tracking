#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting update...${NC}"

# Переходим в директорию проекта
cd /var/www/gps

# Активируем виртуальное окружение
source venv/bin/activate

# Получаем последние изменения
git pull

# Устанавливаем зависимости
pip install -r requirements.txt

# Собираем фронтенд
cd frontend
npm install
npm run build
cd ..

# Перезапускаем сервисы
sudo systemctl restart gps-backend
sudo systemctl restart nginx

echo -e "${GREEN}Update completed!${NC}" 