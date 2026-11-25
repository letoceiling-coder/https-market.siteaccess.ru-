#!/bin/bash
set -euo pipefail

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_DIR="/root/backups/helphomes-${STAMP}"
APP_ROOT="/var/www/helphomes.ru"

mkdir -p "$BACKUP_DIR/nginx" "$BACKUP_DIR/compose"
cp -a /opt/rinulik/infra/docker-compose.yml "$BACKUP_DIR/compose/docker-compose.yml"
cp -a /opt/rinulik/infra/nginx "$BACKUP_DIR/nginx"
echo "$STAMP" > "$BACKUP_DIR/STAMP"
echo "backup=$BACKUP_DIR"

if ! id helphomes >/dev/null 2>&1; then
  useradd --system --home "$APP_ROOT" --shell /usr/sbin/nologin helphomes
fi

mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared" "$APP_ROOT/log"
chown -R helphomes:helphomes "$APP_ROOT"
chmod 750 "$APP_ROOT"
chmod 750 "$APP_ROOT/shared"

echo "user=$(id helphomes)"
echo "app_root=$APP_ROOT"
