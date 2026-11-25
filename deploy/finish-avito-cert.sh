#!/bin/bash
set -euo pipefail

echo "=== HTTP AVITO ==="
curl -sS -m 8 -D - -o /dev/null -H "Host: avito.rinulik.ru" http://127.0.0.1/ | head -15
curl -sS -m 8 -o /dev/null -w "avito-http:%{http_code}\n" -H "Host: avito.rinulik.ru" http://127.0.0.1/
curl -sS -m 8 -H "Host: avito.rinulik.ru" http://127.0.0.1/api/v1/health; echo

echo "=== CERTBOT ==="
cd /opt/rinulik/infra
docker compose run --rm --no-deps --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d avito.rinulik.ru \
  --agree-tos --register-unsafely-without-email --non-interactive \
  --keep-until-expiring

test -f /etc/letsencrypt/live/avito.rinulik.ru/fullchain.pem
ls -la /etc/letsencrypt/live/avito.rinulik.ru/

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

APP=/var/www/helphomes-api
SHARED=/var/www/helphomes.ru/shared/.env
install -o helphomes-api -g helphomes-api -m 644 /tmp/hh-avito/cors.php "$APP/config/cors.php"
python3 - <<'PY'
from pathlib import Path

def upsert(path, updates):
    text = Path(path).read_text()
    keys = set()
    out = []
    for line in text.splitlines():
        key = line.split("=", 1)[0] if "=" in line else ""
        if key in updates:
            out.append(f"{key}={updates[key]}")
            keys.add(key)
        else:
            out.append(line)
    for key, value in updates.items():
        if key not in keys:
            out.append(f"{key}={value}")
    Path(path).write_text("\n".join(out) + "\n")

upsert("/var/www/helphomes-api/.env", {
    "APP_URL": "https://avito.rinulik.ru",
    "SESSION_DOMAIN": "avito.rinulik.ru",
    "SANCTUM_STATEFUL_DOMAINS": "avito.rinulik.ru,helphomes.ru,www.helphomes.ru,localhost,localhost:3100,127.0.0.1:3100",
})
upsert("/var/www/helphomes.ru/shared/.env", {
    "NEXT_PUBLIC_API_URL": "https://avito.rinulik.ru",
    "API_INTERNAL_URL": "http://127.0.0.1:8073",
})
print("env updated")
PY
chown helphomes-api:helphomes-api "$APP/.env"
chmod 640 "$APP/.env" "$SHARED"
chown helphomes:helphomes "$SHARED"
sudo -u helphomes-api php "$APP/artisan" optimize

echo "=== HTTPS SMOKE ==="
curl -sS -m 12 -o /dev/null -w "https-avito:%{http_code}\n" --resolve avito.rinulik.ru:443:127.0.0.1 https://avito.rinulik.ru/
curl -sS -m 12 --resolve avito.rinulik.ru:443:127.0.0.1 https://avito.rinulik.ru/api/v1/health; echo
curl -sS -m 8 -o /dev/null -w "rinulik:%{http_code}\n" -k --resolve rinulik.ru:443:127.0.0.1 https://rinulik.ru/
curl -sS -m 8 -o /dev/null -w "hh-host:%{http_code}\n" -H "Host: helphomes.ru" http://127.0.0.1/
echo DONE
