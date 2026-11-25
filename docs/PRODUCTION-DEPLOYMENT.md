# HELP HOMES — production deployment

Дата: 2026-11-01. Сервер: `93.189.229.117`. Домен: `helphomes.ru`.

## Статус приёмки

| Критерий | Статус |
| --- | --- |
| Приложение запущено в production | Да. systemd `helphomes`, Next.js 16.4.3 standalone, `172.18.0.1:3100` |
| Основные маршруты отвечают | Да, HTTP 200 через edge Nginx с `Host: helphomes.ru` |
| DEMO-лента на production | Выключена (`UI_DEMO_MODE=false`). Публичная лента пустая и не выдаёт тестовые карточки за реальные |
| `https://helphomes.ru` доступен | **Нет.** Домен не делегирован: Whois TCI «No entries found», DNS NXDOMAIN |
| Сертификат Let's Encrypt | **Не выпущен.** Certbot: `DNS problem: NXDOMAIN looking up A/AAAA for helphomes.ru` |
| Яндекс Карты без 403 | **Не исправлено.** JS API 3.0 отвечает `403 Invalid api key`. Интерактивные тайлы не загружаются |

Публичный HTTPS нельзя включить, пока домен не зарегистрирован и A-запись не указывает на `93.189.229.117`.

## Развёрнутая версия

- Git HEAD при выкладке: `b5c73d2cc2663aff1f19ac8439221d724171f900` (`Initial commit from Create Next App`).
- Рабочее дерево на момент деплоя было грязным: Phase 8 и деплой-файлы не закоммичены.
- Релиз: `/var/www/helphomes.ru/releases/20261101T202107Z` (карта всегда монтируется, DEMO-подпись только при `UI_DEMO_MODE`).
- Предыдущий релиз для rollback: `/var/www/helphomes.ru/releases/20261101T201935Z`.
- Симлинк: `/var/www/helphomes.ru/current`.
- Сборка: `output: "standalone"`, `npm ci` + `npx next build` на сервере, `UI_DEMO_MODE=false`.

Rollback:

```bash
ln -sfn /var/www/helphomes.ru/previous /var/www/helphomes.ru/current
systemctl restart helphomes
```

Резервная копия Nginx/Compose: `/root/backups/helphomes-20261101T201108Z`.

## Запуск

- Пользователь: `helphomes` (system, nologin).
- Unit: `/etc/systemd/system/helphomes.service` (`Restart=always`, `MemoryMax=768M`, `KillSignal=SIGTERM`).
- Env: `/var/www/helphomes.ru/shared/.env` (режим 640). `HOSTNAME=172.18.0.1`, `PORT=3100`, `UI_DEMO_MODE=false`.
- Порт Next.js слушает только `172.18.0.1:3100`, не `0.0.0.0`.
- Логи: `journalctl -u helphomes`.
- Автозапуск: `systemctl enable helphomes`.
- Health: `curl -H 'Host: helphomes.ru' http://127.0.0.1/` → 200 после restart.

`next dev` на сервере не запускался. PM2 существующих приложений (`agent-rinulik-*`, `neeklo-integrator-api`) не менялся.

## Nginx

Edge — контейнер `rinulik-nginx-1` (порты 80/443). Хостовый Nginx слушает только 8080 и не используется для helphomes.

Добавлен изолированный server block:

- файл: `/opt/rinulik/infra/nginx/helphomes.ru.conf`
- mount: `./nginx/helphomes.ru.conf:/etc/nginx/conf.d/helphomes.conf:ro` в `/opt/rinulik/infra/docker-compose.yml`
- `nginx -t` успешен, контейнер пересоздан только для `nginx`

Прокси: `http://172.18.0.1:3100`, заголовки `Host`, `X-Real-IP`, `X-Forwarded-*`, WebSocket Upgrade, gzip, `client_max_body_size 20m`, кэш `/_next/static/`, security headers без HSTS на HTTP.

Другие vhost не перезаписывались. Проверка `https://rinulik.ru` после reload: HTTP/2 200.

HTTPS-блок для helphomes **не добавлялся**: без сертификата `nginx -t` сломал бы все сайты на 443.

## HTTPS

- Публичный DNS `helphomes.ru` / `www.helphomes.ru`: NXDOMAIN.
- Certbot webroot (`/var/www/certbot`) вызван, выпуск отклонён из-за DNS.
- Автопродление существующего `rinulik-certbot-1` не отключалось.
- Mixed content для публичного HTTPS не проверялся: публичного HTTPS нет.

После появления DNS:

1. A-запись `helphomes.ru` → `93.189.229.117` (WWW — по необходимости).
2. `cd /opt/rinulik/infra && docker compose run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot -d helphomes.ru --email admin@helphomes.ru --agree-tos --no-eff-email --non-interactive`
3. Добавить 443 server block со `ssl_certificate` из `/etc/letsencrypt/live/helphomes.ru/` и редирект 80 → 443.
4. `docker exec rinulik-nginx-1 nginx -t && docker exec rinulik-nginx-1 nginx -s reload`

## HTTP-проверки (через edge, Host: helphomes.ru)

| Путь | Код |
| --- | --- |
| `/` | 200 |
| `/map` | 200 |
| `/messages` | 200 |
| `/search` | 200 |
| `/account/partner` | 200 |
| `/catalog/transport/legkovye` | 200 |
| `/favorites` | 200 |
| `/robots.txt` | 200 |
| `/manifest.webmanifest` | 200 |

Redirect loop не обнаружен. После `systemctl restart helphomes` главная снова 200.

## Яндекс Карты

Проверено:

1. В production-сборку встроен публичный ключ из `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` (длина 36, UUID). Полный ключ в отчёт не выводится.
2. Тип ожидается JavaScript API 3.0. Кабинет Яндекса недоступен из этой сессии — активацию и пакет подтвердить вручную.
3. HTTP Referer в запросе: `https://helphomes.ru/` и `http://localhost:3100/`.
4. CSP в приложении нет, запрос API не блокируется политикой.
5. Точный ответ: `HTTP 403 {"statusCode":403,"error":"Forbidden","message":"Invalid api key"}`.
6. OSM / iframe / чужие тайлы не подключались.
7. На `/map` после фикса пустой выдачи монтируется карта и показывается состояние «Яндекс отклонил API-ключ». Список пустой, без фейковых точек.

Не считать карты исправленными, пока API не начнёт отдавать JS без 403 и в браузере не появятся тайлы Яндекса.

### Что сделать в кабинете разработчика

1. Открыть [developer.tech.yandex.ru](https://developer.tech.yandex.ru/).
2. Ключ должен быть от пакета **JavaScript API** (не отдельный Геокодер и не MapKit).
3. Поле **HTTP Referer** обязательно: `localhost` и после делегирования домена — `helphomes.ru` (при необходимости `www.helphomes.ru`).
4. Дождаться активации до 15 минут.
5. Если ключ другого пакета — выпустить новый JS API ключ и подставить в `/var/www/helphomes.ru/shared/.env`, затем **пересобрать** приложение: `NEXT_PUBLIC_*` вшивается в билд.
6. Платный Геокодер не включать без отдельного подтверждения.

## DEMO

Production собран с `UI_DEMO_MODE=false`. Главная: «Объявлений пока нет». Карта: 0 объявлений, без случайных координат. Тестовые формы не имитируют оплату.

## Скриншоты

Сняты с production-процесса через SSH-туннель `127.0.0.1:3101 → 172.18.0.1:3100` (публичного DNS нет).

- `docs/screenshots/production-home-1440.png`
- `docs/screenshots/production-home-390.png`
- `docs/screenshots/production-search-1440.png`
- `docs/screenshots/production-map-390.png`
- `docs/screenshots/production-map-1440.png`

## Оставшиеся блокеры

1. Зарегистрировать `helphomes.ru` и указать A на `93.189.229.117`.
2. Выпустить сертификат и включить HTTPS + редирект.
3. Выпустить/починить валидный ключ JavaScript API 3.0 с Referer.
4. Закоммитить рабочее дерево, чтобы rollback опирался на git, а не только на каталог релиза.
5. Страницы `/samples/*` и `/properties/demo-*` остаются в роутинге как код; в публичной ленте не показываются.
