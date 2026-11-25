#!/bin/bash
set -euo pipefail

echo "=== OS ==="
. /etc/os-release
echo "$PRETTY_NAME"
uname -r

echo "=== PHP ==="
php -v | head -1
php -m | grep -E "mbstring|xml|curl|zip|pgsql|bcmath|intl|gd|opcache|redis|pdo" || true

echo "=== COMPOSER ==="
composer --version

echo "=== SECRET LEAK ==="
for path in /.env /storage /vendor /bootstrap/cache; do
  code=$(curl -sS -m 6 -o /dev/null -w "%{http_code}" "http://127.0.0.1:8073$path")
  echo "local $path $code"
  code=$(curl -sS -m 6 -o /dev/null -w "%{http_code}" -H "Host: api.helphomes.ru" "http://127.0.0.1$path")
  echo "edge $path $code"
done

echo "=== API ==="
curl -sS -m 8 http://127.0.0.1:8073/api/v1/health; echo
curl -sS -m 8 -o /dev/null -w "categories:%{http_code}\n" http://127.0.0.1:8073/api/v1/categories
curl -sS -m 8 -o /dev/null -w "listings:%{http_code}\n" http://127.0.0.1:8073/api/v1/listings
curl -sS -m 8 http://127.0.0.1:8073/api/v1/listings/1; echo
curl -sS -m 8 -D - -o /dev/null -H "Origin: https://helphomes.ru" -H "Access-Control-Request-Method: GET" -X OPTIONS http://127.0.0.1:8073/api/v1/health | grep -iE "HTTP/|access-control"
curl -sS -m 8 -D - -o /dev/null -H "Origin: https://evil.example" http://127.0.0.1:8073/api/v1/health | grep -iE "HTTP/|access-control"

echo "=== FRONT ==="
for p in / /map /search /catalog /account /favorites /messages /about /account/partner; do
  code=$(curl -sS -m 10 -o /dev/null -w "%{http_code}" -H "Host: helphomes.ru" "http://127.0.0.1$p")
  echo "$p $code"
done
curl -sS -m 10 -H "Host: helphomes.ru" http://127.0.0.1/about | grep -o "API: [^<]*" | head -1

echo "=== OTHER ==="
curl -sS -m 8 -o /dev/null -w "rinulik:%{http_code}\n" -k --resolve rinulik.ru:443:127.0.0.1 https://rinulik.ru/ || true

echo "=== DNS PUBLIC ==="
dig +time=4 +tries=1 +short helphomes.ru A @8.8.8.8 || true
dig +time=4 +tries=1 +short api.helphomes.ru A @8.8.8.8 || true
echo "=== DNS BEGGET ==="
dig +time=4 +tries=1 +short helphomes.ru A @ns1.beget.com || true
dig +time=4 +tries=1 +short api.helphomes.ru A @ns1.beget.com || true

echo "=== CERTBOT DRY ==="
if [ -n "$(dig +time=4 +tries=1 +short helphomes.ru A @8.8.8.8)" ]; then
  echo "public DNS ready"
else
  echo "public DNS NXDOMAIN — skip live certbot to avoid Let's Encrypt failures"
fi

echo "=== SERVICES ==="
systemctl is-active helphomes helphomes-api-queue helphomes-api-scheduler php8.3-fpm redis-server
docker inspect -f "{{.State.Status}}" helphomes-postgres

echo "=== CURRENT ==="
readlink -f /var/www/helphomes.ru/current
readlink -f /var/www/helphomes.ru/previous
systemctl is-active helphomes
