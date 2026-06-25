# registroreservas — Contexto para Claude

## Repositorio

https://github.com/PabloCastroCastro/registroreservas

## Descripción
Sistema de gestión de reservas para Casa de Miranda (casa rural). Permite registrar reservas, huéspedes, hacer check-in, generar facturas y cancelar/eliminar reservas.

## Stack

- **Backend**: Node.js + Express, ES Modules (`import/export`), MySQL 8.0
- **Frontend**: Next.js 13 (static export), TypeScript, Tailwind CSS, Flowbite React 0.4.x
- **Infraestructura**: Docker Compose, nginx (reverse proxy + HTTPS), Raspberry Pi OS 64-bit

## Arquitectura

```
nginx (80→443 redirect, SSL termination)
  ├── /           → static files (Next.js build output en /usr/share/nginx/html)
  ├── /reserva    → backend:3003
  ├── /factura    → backend:3003
  ├── /cliente    → backend:3003
  ├── /loginuser  → backend:3003
  └── /upload-booking → backend:3003
```

## Despliegue (Raspberry Pi)

- **IP estática**: `192.168.1.182` (configurada con nmcli, usuario: `pablo`, hostname: `genzo`)
- **Rama de producción**: `main`
- **Arranque**: `infrastructure/launch-docker.sh` (hace `docker compose build frontend` antes que el resto para que nginx pueda copiar los estáticos)
- **Base de datos**: exportar con `infrastructure/db-export.ps1` desde Windows, copiar con `scp` e importar con `infrastructure/db-import.sh`
- **Archivo de contraseñas**: `server/configuration/password.json` — NO está en el repo (gitignored). Hay que copiarlo manualmente a la Raspberry Pi con `scp` antes de rebuildar el backend.

## Convenciones importantes

### Tailwind CSS
Solo existen los colores **custom** definidos en `tailwind.config.js`. Los colores de la escala estándar de Tailwind (`bg-yellow-400`, `bg-red-500`, etc.) **no existen** en este proyecto.

| Clase | Color |
|-------|-------|
| `bg-green` | #13ce66 |
| `bg-yellow` | #ffc82c |
| `bg-orange` | #ff7849 |
| `bg-gray-dark` | #273444 |
| `bg-gray` | #8492a6 |
| `bg-gray-light` | #d3dce6 |

### Flowbite React 0.4.x
- **No soporta** `color="warning"`, `color="failure"`, etc. en componentes `<Button>`.
- Usar siempre `className` con los colores custom de Tailwind.

### Números de factura / confirmation_number
Formato: `YYYYMMDD` (fecha checkout) + 3 dígitos secuenciales por fecha.
Generado en `server/invoices/getInvoiceNumber.js` usando la tabla `casademiranda.invoice_sequence`.

### Estado de reservas
- `state = 'ok'` → reserva activa
- `state = 'cancelada'` → reserva cancelada (se puede filtrar en la UI con el checkbox "Ver canceladas")

## Estructura de ramas

- `main` → producción (Raspberry Pi)
- `develop` → integración
- `feature/GH-XX` → features por issue

## Archivos de configuración sensibles (no en repo)

- `server/configuration/password.json` — contraseñas BD, email, secret JWT
- `infrastructure/certs/` — certificados SSL autofirmados (sí están en repo)
