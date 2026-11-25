#!/bin/bash
set -euo pipefail
echo "=== DEFAULT 80 CATCH ==="
grep -n "server_name\|return 301\|default_server" /opt/rinulik/infra/nginx/rinulik.conf /opt/rinulik/infra/nginx/off-domains.conf | head -80
echo "=== HTTPS AVITO NOW ==="
curl -sk -m 8 -o /dev/null -w "https-avito:%{http_code} ssl:%{ssl_verify_result}\n" --resolve avito.rinulik.ru:443:127.0.0.1 https://avito.rinulik.ru/ || true
echo "=== CERT RENEW EXAMPLE ==="
ls /etc/letsencrypt/renewal | head
echo "=== ASSISTENT VHOST HEAD ==="
sed -n '1,80p' /opt/rinulik/infra/nginx/assistent.rinulik.conf
echo "=== COMPOSE CERTBOT SERVICE ==="
python3 - <<'PY'
from pathlib import Path
text = Path("/opt/rinulik/infra/docker-compose.yml").read_text()
start = text.find("certbot:")
print(text[start:start+900])
PY
