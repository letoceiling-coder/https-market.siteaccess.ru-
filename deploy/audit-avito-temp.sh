#!/bin/bash
set -euo pipefail
echo "=== DNS ==="
dig +short avito.rinulik.ru A @8.8.8.8
echo "=== CERTS ==="
ls /etc/letsencrypt/live/
echo "=== HELPHOMES CONF ==="
wc -l /opt/rinulik/infra/nginx/helphomes.ru.conf
grep -n "server_name" /opt/rinulik/infra/nginx/helphomes.ru.conf
echo "=== COMPOSE NGINX ==="
grep -n "helphomes\|certbot\|nginx" /opt/rinulik/infra/docker-compose.yml | head -40
echo "=== SAMPLE SSL VHOST ==="
python3 - <<'PY'
from pathlib import Path
p = Path("/opt/rinulik/infra/nginx")
for f in sorted(p.glob("*.conf")):
    text = f.read_text(errors="replace")
    if "listen 443" in text and "ssl_certificate" in text:
        print("FILE", f)
        for i, line in enumerate(text.splitlines(), 1):
            if any(k in line for k in ("server_name", "ssl_certificate", "listen 443", "listen 80")):
                print(f"{i}:{line}")
        print("---")
        break
PY
echo "=== CURRENT HOST HIT ==="
curl -sS -m 8 -o /dev/null -w "avito-http:%{http_code} host:%{header_json}\n" -D - -o /dev/null -H "Host: avito.rinulik.ru" http://127.0.0.1/ | head -20
echo "=== RINULIK ==="
curl -sS -m 8 -o /dev/null -w "rinulik:%{http_code}\n" -k --resolve rinulik.ru:443:127.0.0.1 https://rinulik.ru/
echo "=== HELPHOMES APP ==="
systemctl is-active helphomes
curl -sS -m 8 -o /dev/null -w "hh:%{http_code}\n" -H "Host: helphomes.ru" http://127.0.0.1/
curl -sS -m 8 http://127.0.0.1:8073/api/v1/health; echo
