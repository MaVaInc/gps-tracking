#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

REPO_URL="https://github.com/MaVaInc/gps-tracking.git"

echo -e "${GREEN}Starting deployment...${NC}"

# Обновляем систему
echo -e "${GREEN}Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
echo -e "${GREEN}Installing required packages...${NC}"
sudo apt install -y git python3-pip python3-venv nginx certbot python3-certbot-nginx

# Устанавливаем Node.js
echo -e "${GREEN}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверяем версии
echo -e "${GREEN}Checking versions...${NC}"
node --version
npm --version
python3 --version
pip3 --version

# Создаем пользователя для приложения если его нет
sudo useradd -m -s /bin/bash gps_app || true

# Клонируем репозиторий
echo -e "${GREEN}Cloning repository...${NC}"
cd /var/www
sudo rm -rf gps # На случай если директория существует
git clone $REPO_URL gps
sudo chown -R gps_app:gps_app gps

# Создаем виртуальное окружение и устанавливаем зависимости
echo -e "${GREEN}Setting up Python environment...${NC}"
cd /var/www/gps
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Устанавливаем зависимости и собираем фронтенд
echo -e "${GREEN}Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..

# Создаем .env файл
echo -e "${GREEN}Creating .env file...${NC}"
cat > .env << EOL
DATABASE_URL=sqlite:///./prod.db
FRONTEND_URL=https://anidapha.us
CORS_ORIGINS=https://anidapha.us
DEBUG=False
EOL

# Создаем systemd сервис для backend
echo -e "${GREEN}Creating systemd service...${NC}"
sudo bash -c 'cat > /etc/systemd/system/gps-backend.service << EOL
[Unit]
Description=GPS Tracking Backend
After=network.target

[Service]
User=gps_app
Group=gps_app
WorkingDirectory=/var/www/gps
Environment="PATH=/var/www/gps/venv/bin"
ExecStart=/var/www/gps/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
EOL'

# Настраиваем nginx
echo -e "${GREEN}Configuring nginx...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/gps << EOL
server {
    listen 80;
    listen [::]:80;
    server_name anidapha.us 94.156.114.240;

    root /var/www/gps/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOL'

# Проверяем и перезапускаем
sudo nginx -t && sudo systemctl restart nginx

# Получаем SSL сертификат только для домена
echo -e "${GREEN}Getting SSL certificate...${NC}"
sudo certbot --nginx -d anidapha.us --non-interactive --agree-tos --email mavainc@gmail.com

# Перезапускаем сервисы
echo -e "${GREEN}Restarting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable gps-backend
sudo systemctl restart gps-backend
sudo systemctl restart nginx

echo -e "${GREEN}Deployment completed!${NC}" 