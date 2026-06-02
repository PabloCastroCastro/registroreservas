#!/bin/bash

if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado. Ejecuta: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Docker no está corriendo. Ejecuta: sudo systemctl start docker"
    exit 1
fi

echo "Iniciando servicios..."
<<<<<<< HEAD
docker compose build frontend
=======
>>>>>>> develop
docker compose up -d --build
echo "Servicios iniciados."

# Para instalar como servicio de arranque automático:
#   sudo cp registroreservas.service /etc/systemd/system/
#   sudo systemctl daemon-reload
#   sudo systemctl enable registroreservas
#   sudo systemctl start registroreservas
