# Verificar si Docker está instalado
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "Docker no está instalado o no está en el PATH."
    Pause
    exit
}

# Verificar si Docker está corriendo
$dockerInfo = docker info 2>$null
if (-not $dockerInfo) {
    Write-Host "Docker no está corriendo. Por favor inicia Docker Desktop."
    Pause
    exit
}

# Ejecutar docker compose
Write-Host "Docker está listo. Iniciando servicios con Docker Compose..."
docker compose up -d --build

Write-Host "Servicios iniciados. Presiona cualquier tecla para salir."
Pause