#!/bin/bash
set -euo pipefail
echo "=== ABOUT TEXT ==="
curl -sS -m 12 -H "Host: helphomes.ru" http://127.0.0.1/about | python3 -c "import sys,re; t=sys.stdin.read(); print(re.findall(r'API:[^<\\\\]{0,80}', t)[:5]); print('ok' if 'категор' in t or 'categories' in t or 'ok' in t else 'no-api')"
echo "=== OTHER ==="
curl -sS -m 8 -o /dev/null -w "rinulik:%{http_code}\n" -k --resolve rinulik.ru:443:127.0.0.1 https://rinulik.ru/ || true
echo "=== DNS ==="
echo -n "public "; dig +time=3 +tries=1 +short helphomes.ru A @8.8.8.8 || true
echo -n "whois "; whois helphomes.ru | grep -i "No entries\|state:\|nserver" | head -5
systemctl is-active helphomes helphomes-api-queue php8.3-fpm
