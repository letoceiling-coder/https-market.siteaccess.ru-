# market.siteaccess.ru — деплой

Дата: 2026-11-24  
Сервер: `31.192.111.33` (`hastkey`)  
Домен: `market.siteaccess.ru` → A `31.192.111.33`

## Статус

| Критерий | Статус |
| --- | --- |
| DNS A-запись | Да |
| Next.js production (standalone) | Да, systemd `market-siteaccess` |
| Порт приложения | `127.0.0.1:3110` |
| Nginx HTTP→HTTPS | Да |
| Let's Encrypt | Да, до `2027-02-22` |
| `/` `/map` `/catalog` | HTTPS 200 |
| DEMO в публичной ленте | Выключен (`UI_DEMO_MODE=false`) |
| Деплой старого `helphomes.ru` на 93.x | Не затрагивался |

## Пути

- Код / релизы: `/var/www/market.siteaccess.ru/`
- Текущий релиз: `/var/www/market.siteaccess.ru/current` → `releases/20261124T163918Z`
- Env: `/var/www/market.siteaccess.ru/shared/.env`
- Unit: `/etc/systemd/system/market-siteaccess.service`
- Nginx: `/etc/nginx/sites-available/market.siteaccess.ru`

## Операции

```bash
systemctl status market-siteaccess
journalctl -u market-siteaccess -f
# rollback
ln -sfn /var/www/market.siteaccess.ru/previous /var/www/market.siteaccess.ru/current
systemctl restart market-siteaccess
```

Повторный релиз (с рабочей машины):

1. Упаковать проект без `node_modules` / `.next`
2. `scp` → `/tmp/helphomes-market.tar.gz`
3. На сервере: распаковать в `/var/www/market.siteaccess.ru/src` и `bash /tmp/remote-release-market.sh`

Шаблоны в репозитории: `deploy/market.*`, `deploy/remote-release-market.sh`.

## Яндекс Карты

Ключ в production env не задан. На `/map` ожидается setup-state «Требуется настройка Яндекс Карт». Для тайлов добавить `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` с Referer `https://market.siteaccess.ru/` и **пересобрать** релиз.
