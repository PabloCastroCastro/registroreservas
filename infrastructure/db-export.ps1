# Exporta la base de datos del contenedor Docker actual
# Genera el archivo bbdd/casademiranda-dump.sql

$CONTAINER = docker ps --filter "name=db" --format "{{.Names}}" | Select-Object -First 1

if (-not $CONTAINER) {
    Write-Host "No se encontro el contenedor de la base de datos. Asegurate de que Docker esta corriendo."
    exit 1
}

Write-Host "Exportando base de datos desde $CONTAINER..."
docker exec $CONTAINER mysqldump -u root -ppassword casademiranda | Out-File -FilePath "./bbdd/casademiranda-dump.sql" -Encoding utf8

Write-Host "Exportacion completada: bbdd/casademiranda-dump.sql"
Write-Host ""
Write-Host "Para copiar a la Raspberry Pi:"
Write-Host "  scp bbdd/casademiranda-dump.sql pi@192.168.1.171:~/registroreservas/infrastructure/bbdd/"
