#!/bin/bash
# Renueva el certificado Tailscale y reinicia nginx.
# Ejecutar manualmente o añadir a cron: 0 0 1 * * /home/pablo/registroreservas/infrastructure/tailscale-cert-renew.sh

set -e

HOSTNAME="genzo.tailbbc079.ts.net"
CERT_DIR="$(dirname "$0")/tailscale-certs"

mkdir -p "$CERT_DIR"

tailscale cert --cert-file "$CERT_DIR/$HOSTNAME.crt" --key-file "$CERT_DIR/$HOSTNAME.key" "$HOSTNAME"

docker compose -f "$(dirname "$0")/compose.yaml" restart nginx

echo "Certificado renovado y nginx reiniciado."
