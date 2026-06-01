#!/bin/bash
# Importa el dump en el contenedor MySQL de la Raspberry Pi
# Uso: ./db-import.sh bbdd/casademiranda-dump.sql

DUMP_FILE=${1:-"bbdd/casademiranda-dump.sql"}

if [ ! -f "$DUMP_FILE" ]; then
    echo "Archivo no encontrado: $DUMP_FILE"
    echo "Uso: ./db-import.sh <ruta-al-dump.sql>"
    exit 1
fi

CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -1)

if [ -z "$CONTAINER" ]; then
    echo "No se encontro el contenedor de la base de datos. Asegurate de que los servicios esten corriendo."
    exit 1
fi

echo "Importando $DUMP_FILE en $CONTAINER..."
docker exec -i "$CONTAINER" mysql -u root -ppassword casademiranda < "$DUMP_FILE"
echo "Importacion completada."
