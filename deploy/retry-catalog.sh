#!/bin/bash
set -euo pipefail
sed -i 's/\r$//' /tmp/hh-laravel-src/2026_11_01_210000_create_categories_table.php
install -o helphomes-api -g helphomes-api -m 644 \
  /tmp/hh-laravel-src/2026_11_01_210000_create_categories_table.php \
  /var/www/helphomes-api/database/migrations/2026_11_01_210000_create_categories_table.php
sudo -u helphomes-api php /var/www/helphomes-api/artisan db:wipe --force || true
bash /tmp/hh-scripts/apply-catalog-api.sh
