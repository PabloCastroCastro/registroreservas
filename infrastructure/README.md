# Instalación en Raspberry Pi

## Requisitos

- Raspberry Pi 4 o superior
- Raspberry Pi OS **64 bits** (necesario para MySQL)
- Conexión a la red local por cable ethernet
- Acceso SSH habilitado

---

## 1. Preparar la Raspberry Pi

### 1.1 Habilitar SSH

En la Raspberry Pi con monitor conectado, o desde Raspberry Pi Imager al grabar la tarjeta SD (opción recomendada):

```bash
sudo systemctl enable ssh
sudo systemctl start ssh
```

### 1.2 Obtener la IP temporal

```bash
hostname -I
```

Desde este momento puedes trabajar en remoto desde tu ordenador.

---

## 2. Conectarse por SSH

Desde Windows (PowerShell o CMD):

```powershell
ssh pi@<ip-temporal>
```

El usuario por defecto es `pi`. Sustituye `<ip-temporal>` por la IP obtenida en el paso anterior.

---

## 3. Configurar IP estática

Para que el sistema siempre sea accesible en `192.168.1.171`:

```bash
sudo nano /etc/dhcpcd.conf
```

Añadir al final del archivo:

```
interface eth0
static ip_address=192.168.1.171/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8
```

Guardar (`Ctrl+O`, `Enter`, `Ctrl+X`) y reiniciar:

```bash
sudo reboot
```

Reconectarse con la IP fija:

```powershell
ssh pi@192.168.1.171
```

---

## 4. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Cerrar la sesión SSH y volver a conectarse para que aplique el grupo:

```powershell
exit
ssh pi@192.168.1.171
```

Verificar que Docker funciona:

```bash
docker run hello-world
```

---

## 5. Clonar el repositorio

```bash
git clone https://github.com/PabloCastroCastro/registroreservas.git
cd registroreservas/infrastructure
chmod +x launch-docker.sh db-import.sh
```

---

## 6. Migrar la base de datos

### 6.1 Exportar desde Windows

En tu ordenador Windows, con los contenedores Docker corriendo:

```powershell
cd infrastructure
.\db-export.ps1
```

Esto genera el archivo `bbdd/casademiranda-dump.sql`.

### 6.2 Copiar a la Raspberry Pi

```powershell
scp bbdd\casademiranda-dump.sql pi@192.168.1.171:~/registroreservas/infrastructure/bbdd/
```

---

## 7. Arrancar los servicios

En la Raspberry Pi:

```bash
cd ~/registroreservas/infrastructure
./launch-docker.sh
```

Esperar ~30 segundos a que MySQL esté listo y luego importar la base de datos:

```bash
./db-import.sh bbdd/casademiranda-dump.sql
```

Verificar que todos los contenedores están corriendo:

```bash
docker ps
```

Deben aparecer: `db`, `backend`, `frontend`, `nginx`.

La aplicación estará disponible en: **https://192.168.1.171**

> El navegador mostrará una advertencia por el certificado autofirmado la primera vez. Acepta la excepción de seguridad para continuar.

---

## 8. Configurar arranque automático

Para que los servicios se inicien automáticamente al encender la Raspberry Pi:

```bash
sudo cp ~/registroreservas/infrastructure/registroreservas.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable registroreservas
sudo systemctl start registroreservas
```

---

## Gestión del servicio

| Acción | Comando |
|--------|---------|
| Ver estado | `sudo systemctl status registroreservas` |
| Parar | `sudo systemctl stop registroreservas` |
| Reiniciar | `sudo systemctl restart registroreservas` |
| Ver logs | `journalctl -u registroreservas -f` |
| Logs de contenedores | `docker compose logs -f` |

---

## Actualizar la aplicación

```bash
cd ~/registroreservas
git pull
cd infrastructure
sudo systemctl restart registroreservas
```
