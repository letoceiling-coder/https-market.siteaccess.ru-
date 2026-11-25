#!/bin/bash
set -euo pipefail

EDGE=/opt/rinulik/infra/nginx/helphomes.ru.conf
HOST_API=/etc/nginx/sites-available/helphomes-api.conf
APP=/var/www/helphomes-api
SHARED=/var/www/helphomes.ru/shared/.env

python3 - <<'PY'
from pathlib import Path
edge = Path("/opt/rinulik/infra/nginx/helphomes.ru.conf")
text = edge.read_text()
marker = "# Temporary public host for HELP HOMES"
if marker in text:
    text = text[:text.index(marker)].rstrip() + "\n"
http = Path("/tmp/hh-avito/avito.rinulik.ru.http.conf").read_text()
edge.write_text(text.rstrip() + "\n\n" + http)
print("edge http appended")
PY

sed -i 's/server_name api.helphomes.ru;/server_name api.helphomes.ru avito.rinulik.ru;/' "$HOST_API"
if ! grep -q 'avito.rinulik.ru' "$HOST_API"; then
  echo "host api server_name missing avito" >&2
  exit 1
fi

nginx -t
systemctl reload nginx
docker exec rinulik-nginx-1 nginx -t
docker exec rinulik-nginx-1 nginx -s reload

echo "=== ACME PATH ==="
mkdir -p /var/www/certbot/.well-known/acme-challenge
echo ok > /var/www/certbot/.well-known/acme-challenge/hh-avito-ping
# certbot volume is docker certbot-www; host /var/www/certbot may not be the same
docker exec rinulik-nginx-1 sh -c 'mkdir -p /var/www/certbot/.well-known/acme-challenge; echo ok > /var/www/certbot/.well-known/acme-challenge/hh-avito-ping'
curl -sS -m 8 -H "Host: avito.rinulik.ru" http://127.0.0.1/.well-known/acme-challenge/hh-avito-ping; echo
curl -sS -m 8 -o /dev/null -w "avito-http:%{http_code}\n" -H "Host: avito.rinulik.ru" http://127.0.0.1/

echo "=== CERTBOT ==="
cd /opt/rinulik/infra
docker compose run --rm --no-deps --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d avito.rinulik.ru \
  --agree-tos --no-eff-email --non-interactive \
  --keep-until-expiring

test -f /etc/letsencrypt/live/avito.rinulik.ru/fullchain.pem

python3 - <<'PY'
from pathlib import Path
edge = Path("/opt/rinulik/infra/nginx/helphomes.ru.conf")
text = edge.read_text()
marker = "# Temporary public host for HELP HOMES"
if marker in text:
    text = text[:text.index(marker)].rstrip() + "\n"
ssl = Path("/tmp/hh-avito/avito.rinulik.ru.ssl.conf").read_text()
edge.write_text(text.rstrip() + "\n\n" + ssl)
print("edge ssl installed")
PY

docker exec rinulik-nginx-1 nginx -t
docker exec rinulik-nginx-1 nginx -s reload

# Laravel CORS + env
install -o helphomes-api -g helphomes-api -m 644 /tmp/hh-avito/cors.php "$APP/config/cors.php"
python3 - <<'PY'
from pathlib import Path
path = Path("/var/www/helphomes-api/.env")
text = path.read_text()
updates = {
    "APP_URL": "https://avito.rinulik.ru",
    "SESSION_DOMAIN": "avito.rinulik.ru",
    "SANCTUM_STATEFUL_DOMAINS": "avito.rinulik.ru,helphomes.ru,www.helphomes.ru,localhost,localhost:3100,127.0.0.1:3100",
}
lines = text.splitlines()
keys = set()
out = []
for line in lines:
    key = line.split("=", 1)[0] if "=" in line else ""
    if key in updates:
        out.append(f"{key}={updates[key]}")
        keys.add(key)
    else:
        out.append(line)
for key, value in updates.items():
    if key not in keys:
        out.append(f"{key}={value}")
path.write_text("\n".join(out) + "\n")
PY
chown helphomes-api:helphomes-api "$APP/.env"
chmod 640 "$APP/.env"
sudo -u helphomes-api php "$APP/artisan" optimize

python3 - <<'PY'
from pathlib import Path
path = Path("/var/www/helphomes.ru/shared/.env")
text = path.read_text()
updates = {
    "NEXT_PUBLIC_API_URL": "https://avito.rinulik.ru",
    "API_INTERNAL_URL": "http://127.0.0.1:8073",
}
lines = text.splitlines()
keys = set()
out = []
for line in lines:
    key = line.split("=", 1)[0] if "=" in line else ""
    if key in updates:
        out.append(f"{key}={updates[key]}")
        keys.add(key)
    else:
        out.append(line)
for key, value in updates.items():
    if key not in keys:
        out.append(f"{key}={value}")
path.write_text("\n".join(out) + "\n")
PY
chmod 640 "$SHARED"
chown helphomes:helphomes "$SHARED"

echo "=== HTTPS SMOKE ==="
curl -sS -m 10 -o /dev/null -w "https-avito:%{http_code}\n" --resolve avito.rinulik.ru:443:127.0.0.1 https://avito.rinulik.ru/
curl -sS -m 10 --resolve avito.rinulik.ru:443:127.0.0.1 https://avito.rinulik.ru/api/v1/health; echo
curl -sS -m 8 -o /dev/null -w "rinulik:%{http_code}\n" -k --resolve rinulik.ru:443:127.0.0.1 https://rinulik.ru/
curl -sS -m 8 -o /dev/null -w "hh-host:%{http_code}\n" -H "Host: helphomes.ru" http://127.0.0.1/
echo DONE
