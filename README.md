# registroreservas

Sistema de gestión de reservas para **Casa de Miranda** (casa rural). Permite registrar reservas, gestionar huéspedes, hacer check-in para el Ministerio del Interior, generar facturas y controlar el estado de las reservas.

## Índice

- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Entorno local](#entorno-local)
- [Flujo de trabajo](#flujo-de-trabajo)
- [Migraciones de base de datos](#migraciones-de-base-de-datos)
- [Despliegue en producción](#despliegue-en-producción)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express, ES Modules (`import/export`) |
| Frontend | Next.js 13 (static export), TypeScript, Tailwind CSS, Flowbite React 0.4.x |
| Base de datos | MySQL 8.0 |
| Infraestructura | Docker Compose, nginx (reverse proxy + HTTPS) |
| Producción | Raspberry Pi OS 64-bit |

---

## Arquitectura

```
nginx (80→443 redirect, SSL autofirmado)
  ├── /              → static files (Next.js build en /usr/share/nginx/html)
  ├── /reserva       → backend:3003
  ├── /factura       → backend:3003
  ├── /cliente       → backend:3003
  ├── /loginuser     → backend:3003
  └── /upload-booking → backend:3003
```

### Estructura de directorios

```
registroreservas/
├── front/
│   └── admin-casademiranda/   # Next.js app (frontend)
├── server/                    # Express API (backend)
│   ├── routes/                # Routers por dominio
│   ├── bookings/              # Lógica de reservas
│   ├── clients/               # Lógica de clientes
│   ├── configuration/         # Lectura de password.json (gitignored)
│   └── sql/                   # Utilidades MySQL
└── infrastructure/
    ├── bbdd/                  # Schema y migraciones SQL
    ├── nginx/                 # Configuración nginx por entorno
    ├── compose.yaml           # Docker Compose
    └── launch-docker.sh       # Script de arranque
```

---

## Entorno local

### Requisitos

- Node.js 18+
- Docker Desktop

### 1. Clonar y configurar

```bash
git clone https://github.com/PabloCastroCastro/registroreservas.git
cd registroreservas
```

Copiar el archivo de contraseñas (no está en el repo):

```
server/configuration/password.json
```

### 2. Arrancar la base de datos

```bash
cd infrastructure/bbdd
docker compose up -d
```

Esto levanta MySQL 8.0 en `localhost:3306` (usuario `root`).

Importar el dump si tienes uno:

```bash
docker exec -i infrastructure-db-1 mysql -u<usuario> -p<contraseña> casademiranda < bbdd/casademiranda-dump.sql
```

### 3. Arrancar el backend

```bash
cd server
npm install
npm start        # puerto 3003
```

### 4. Arrancar el frontend

```bash
cd front/admin-casademiranda
npm install
npm run dev      # puerto 3000
```

La app estará disponible en `http://localhost:3000`. En producción, en `https://<ip-raspberry>`.

---

## Flujo de trabajo

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Producción (Raspberry Pi). **No se pushea directamente.** |
| `develop` | Integración. Las PRs de features se mergean aquí. |
| `feature/GH-XX` | Una rama por issue de GitHub. |

### Ciclo de una feature

```
1. Partir siempre de main actualizado
   git checkout main && git pull

2. Crear rama de feature
   git checkout -b feature/GH-XX

3. Desarrollar y commitear
   git commit -m "[GH-XX]: descripción del cambio"

4. Abrir PR hacia develop (nunca hacia main)
   gh pr create --base develop --title "[GH-XX] Título"

5. Mergear la PR en develop

6. Cuando develop está listo para producción → PR develop → main
```

### Convenciones de commit

```
[GH-XX]: verbo en infinitivo + qué hace el cambio
```

Ejemplos:
- `[GH-116]: permitir cambiar habitación al editar una reserva`
- `[GH-123]: añadir campo de notas en la reserva`

---

## Migraciones de base de datos

Cuando un cambio requiere modificar el schema de BD:

1. Crear el script en `infrastructure/bbdd/migrations/GH-XXX-descripcion.sql`
2. Actualizar también `infrastructure/bbdd/schema.sql`
3. Documentarlo en la descripción de la PR

### Aplicar una migración

**Local:**
```bash
docker exec -i infrastructure-db-1 mysql -u<usuario> -p<contraseña> casademiranda < infrastructure/bbdd/migrations/<archivo>.sql
```

**Producción (Raspberry Pi):**
```bash
docker exec -i infrastructure-db-1 mysql -u<usuario> -p<contraseña> casademiranda < infrastructure/bbdd/migrations/<archivo>.sql
```

---

## Despliegue en producción

La producción es una Raspberry Pi en la red local (ver IP y usuario en la configuración del equipo).

### Despliegue estándar

```bash
ssh <usuario>@<ip-raspberry>
cd ~/registroreservas
git pull
cd infrastructure
bash launch-docker.sh
```

`launch-docker.sh` construye primero el frontend (para que nginx pueda copiar los estáticos) y luego levanta todos los servicios.

### Archivos que hay que copiar manualmente antes de rebuildar

Estos archivos no están en el repo y deben copiarse con `scp`:

```bash
# Contraseñas
scp server/configuration/password.json <usuario>@<ip-raspberry>:~/registroreservas/server/configuration/

# Certificados SSL (si se renuevan)
scp infrastructure/certs/* <usuario>@<ip-raspberry>:~/registroreservas/infrastructure/certs/
```

### Gestión de contenedores

| Acción | Comando |
|--------|---------|
| Ver estado | `docker ps` |
| Reiniciar todo | `bash launch-docker.sh` |
| Reiniciar solo backend | `docker restart infrastructure-backend-1` |
| Logs en vivo | `docker compose logs -f` |
| Logs de un servicio | `docker compose logs -f backend` |

### Base de datos en producción

**Exportar desde local (Windows):**
```powershell
cd infrastructure
.\db-export.ps1
```

**Copiar e importar en la Raspberry Pi:**
```powershell
scp infrastructure\bbdd\casademiranda-dump.sql <usuario>@<ip-raspberry>:~/registroreservas/infrastructure/bbdd/
```
```bash
# En la Raspberry Pi
docker exec -i infrastructure-db-1 mysql -u<usuario> -p<contraseña> casademiranda < infrastructure/bbdd/casademiranda-dump.sql
```

---

## Notas de desarrollo

### Colores Tailwind

Solo existen los colores **custom** definidos en `tailwind.config.js`. Los colores estándar de Tailwind (`bg-red-500`, `bg-yellow-400`, etc.) **no están disponibles**.

| Clase | Color |
|-------|-------|
| `bg-green` | #13ce66 |
| `bg-yellow` | #ffc82c |
| `bg-orange` | #ff7849 |
| `bg-gray-dark` | #273444 |
| `bg-gray` | #8492a6 |
| `bg-gray-light` | #d3dce6 |

### Flowbite React 0.4.x

No soporta `color="warning"`, `color="failure"`, etc. en `<Button>`. Usar siempre `className` con los colores custom de Tailwind.

### Archivos sensibles (no en el repo)

| Archivo | Descripción |
|---------|-------------|
| `server/configuration/password.json` | Contraseñas BD, email, secret JWT |
| `infrastructure/certs/` | Certificados SSL (sí están en el repo) |
