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

---

## Rotar la contraseña de la base de datos

Cambiar `MYSQL_ROOT_PASSWORD` en `compose.yaml`/`.env` **no rota la contraseña real** de un MySQL que ya tiene datos: esa variable solo la usa la imagen oficial de MySQL para fijarla la primera vez que se inicializa el volumen (`bbdd/data`). En un despliegue ya en marcha hay que rotarla a mano contra el MySQL en vivo:

```bash
cd ~/registroreservas/infrastructure

# 1. Backup antes de tocar nada
docker compose exec db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" casademiranda' > "bbdd/casademiranda-backup-$(date +%Y%m%d-%H%M).sql"

# 2. Generar contraseña nueva y rotarla en el MySQL en vivo
NEW_PASS=$(openssl rand -hex 24)
docker compose exec db mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e \
  "ALTER USER 'root'@'%' IDENTIFIED BY '${NEW_PASS}'; ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_PASS}'; FLUSH PRIVILEGES;"

# Verificar que la nueva contraseña funciona antes de seguir
docker compose exec db mysql -u root -p"${NEW_PASS}" -e "SELECT 1;"

# 3. Guardar la nueva contraseña en .env
echo "MYSQL_ROOT_PASSWORD=${NEW_PASS}" >> .env

# 4. Actualizar sql.password en password.json (en claro) y volver a cifrarlo
docker compose run --rm \
  -v "$(pwd)/../server/configuration:/server/configuration" \
  -e NEW_PASS="${NEW_PASS}" \
  backend node -e "
    const fs = require('fs');
    const p = './configuration/password.json';
    const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
    cfg['sql.password'] = process.env.NEW_PASS;
    fs.writeFileSync(p, JSON.stringify(cfg, null, 4) + '\n');
  "
docker compose run --rm \
  -v "$(pwd)/../server/configuration:/server/configuration" \
  backend node configuration/encryptSecrets.js

# 5. Reiniciar el backend con la contraseña nueva
docker compose up -d --build backend
rm -f ../server/configuration/password.json.bak
```

> `password.json` guarda sus valores sensibles cifrados con AES-256-GCM (clave maestra `CONFIG_MASTER_KEY` en `.env`, ver `server/configuration/secretsCrypto.js`). El paso 4 actualiza `sql.password` en claro y lo vuelve a cifrar con `encryptSecrets.js`.

Verificar que el backend arrancó bien antes de dar la rotación por terminada:

```bash
docker compose logs --tail=30 backend
curl -s http://localhost:3003/reserva -o /dev/null -w "%{http_code}\n"
```
