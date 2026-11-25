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
| Тестовые объявления | Включены (`UI_DEMO_MODE=true` в `shared/.env`), 114 шт., 44 с ИИ-фото, 8 с видео |
| Деплой старого `helphomes.ru` на 93.x | Не затрагивался |

## Пути

- Код / релизы: `/var/www/market.siteaccess.ru/`
- Текущий релиз: `/var/www/market.siteaccess.ru/current` → `releases/20261125T064013Z`
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

## Генерация тестовых медиа

ComfyUI на этом же сервере (`127.0.0.1:8188`), графы из `studio.siteaccess.ru`.

1. Описать объявления в `scripts/gen_listings_spec.py`, `python scripts/gen_listings_spec.py`
2. `scp scripts/gen_listings_spec.json scripts/gen_media_comfy.js root@31.192.111.33:/root/market-gen/`
3. На сервере: `node gen_media_comfy.js gen_listings_spec.json out` (фото ≈6 с, видео ≈95 с), видео перекодировать в H.264 `+faststart`
4. Локально: `python scripts/ingest_generated.py <папка с png/mp4>` → `public/media/g`, `media.json`, `ui-demo-listings.json`
