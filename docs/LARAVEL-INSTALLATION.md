# HELP HOMES — установка Laravel Backend

Дата: 2026-11-01. Сервер: `93.189.229.117`. Frontend: `https://helphomes.ru`. Backend: `https://api.helphomes.ru`.

Секреты, пароли и приватные ключи в этот файл не входят.

## Статус приёмки

| Критерий | Статус |
| --- | --- |
| Frontend `helphomes.ru` без смены дизайна | Да. Главная, каталог, поиск, карта, кабинет отвечают 200. DEMO выключен |
| Laravel установлен отдельно от Next.js | Да. `/var/www/helphomes-api`, пользователь `helphomes-api` |
| API отвечает | Да, внутренне: `http://127.0.0.1:8073` и edge `Host: api.helphomes.ru` |
| PostgreSQL | Да, изолированный контейнер `helphomes-postgres` на `127.0.0.1:5437` |
| Redis, cache, queue | Да. Redis только localhost. Cache/queue = redis |
| Queue worker и scheduler | Да. systemd `helphomes-api-queue`, `helphomes-api-scheduler` |
| Публичный HTTPS `https://api.helphomes.ru` | Нет. `helphomes.ru` в реестре .ru отсутствует |
| Временный публичный адрес | Да. `https://avito.rinulik.ru` (сертификат до 2027-01-30) |
| Next.js видит backend | Да. `/about` запрашивает health, категории и объявления через внутренний URL |

## Версии

| Компонент | Значение |
| --- | --- |
| ОС | Ubuntu 24.04.4 LTS, ядро 6.8.0-139-generic |
| Laravel | 13.39.0 (skeleton 13.11.0) |
| PHP | 8.3.6 (CLI + отдельный FPM-пул) |
| Composer | 2.11.1 |
| PostgreSQL | 16 Alpine, контейнер `helphomes-postgres` |
| Redis | системный `redis-server`, `127.0.0.1:6379` |
| Nginx host | слушает `127.0.0.1:8073` и `172.18.0.1:8073` |
| Nginx edge | Docker `rinulik-nginx-1` (80/443), отдельный server_name `api.helphomes.ru` |
| Next.js | 16.4.3 standalone, релиз `20261101T205800Z` |

PHP-расширения: `php-fpm`, `php-cli`, `mbstring`, `xml`, `curl`, `zip`, `pgsql`/`pdo_pgsql`, `bcmath`, `intl`, `gd`, `Zend OPcache`. Для Redis используется `predis`, расширение `phpredis` не требуется.

## Путь установки

- Приложение: `/var/www/helphomes-api`
- Document root: `/var/www/helphomes-api/public`
- Пользователь: `helphomes-api` (system, nologin)
- `.env`: `/var/www/helphomes-api/.env` (режим 640, не в Git)
- Резервная копия до правок: `/root/backups/helphomes-api-20261101T204541Z`
- Frontend не переносился и не удалялся: `/var/www/helphomes.ru`

Production `.env` (без секретов):

```
APP_NAME="HELP HOMES API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.helphomes.ru
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5437
DB_DATABASE=helphomes
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=cookie
SESSION_DOMAIN=.helphomes.ru
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SANCTUM_STATEFUL_DOMAINS=helphomes.ru,www.helphomes.ru,localhost,localhost:3100,127.0.0.1:3100
```

`APP_KEY` сгенерирован на сервере. Пароль БД хранится только в `.env` и в `/root/helphomes-api-db.secret` (режим 600).

## PHP-FPM

Отдельный пул, чужие сайты не переключались на него. Файл `www.conf` не менялся.

- Конфиг: `/etc/php/8.3/fpm/pool.d/helphomes-api.conf`
- Шаблон в репозитории: `deploy/helphomes-api.fpm.conf`
- Сокет: `/run/php/php8.3-fpm-helphomes-api.sock` (`www-data:www-data`, 0660)
- `pm=ondemand`, `pm.max_children=8`, `memory_limit=128M`
- `display_errors=off`

## Nginx

Публичные 80/443 занимает Docker `rinulik-nginx-1`. Хостовый Nginx не слушает публичный :80, чтобы не конфликтовать с другими проектами.

### Хост (PHP)

- `/etc/nginx/sites-available/helphomes-api.conf`
- `/etc/nginx/sites-enabled/helphomes-api.conf`
- Шаблон: `deploy/helphomes-api.host-nginx.conf`
- `listen 172.18.0.1:8073` и `127.0.0.1:8073`
- `try_files` → `index.php` → unix-сокет FPM
- закрыты `/.env`, `/storage`, скрытые файлы

`nginx -t` на хосте: ok. Reload только хостового Nginx.

### Edge (Docker)

В `/opt/rinulik/infra/nginx/helphomes.ru.conf` добавлен отдельный `server_name api.helphomes.ru` (HTTP :80 → `172.18.0.1:8073`, ACME webroot `/var/www/certbot`). Шаблон: `deploy/api.helphomes.ru.edge.conf`.

Проверка: `docker exec rinulik-nginx-1 nginx -t` и `nginx -s reload`. Compose **не** пересоздавался. Конфиги других доменов не редактировались. `https://rinulik.ru` после reload: 200.

HTTPS-блок для `api.helphomes.ru` / `helphomes.ru` **не добавлялся**: без сертификата `nginx -t` уронил бы все сайты на 443.

## PostgreSQL

Использован отдельный контейнер, не `rinulik-db` на `:5432`.

| Параметр | Значение |
| --- | --- |
| Контейнер | `helphomes-postgres` (postgres:16-alpine) |
| Порт | `127.0.0.1:5437` |
| БД | `helphomes` |
| Пользователь | `helphomes` (не superuser) |
| Volume | `helphomes-pgdata` |
| Память | 256M |

Базовые миграции Laravel применены:

- `0001_01_01_000000_create_users_table` — Ran
- `0001_01_01_000001_create_cache_table` — Ran
- `0001_01_01_000002_create_jobs_table` — Ran

Бизнес-схема объявлений, компаний и модерации не создавалась.

## Redis и очереди

- Redis слушает только `127.0.0.1` / `::1`, `protected-mode yes`
- Cache: redis
- Queue: redis
- Rate limit API: `60` запросов в минуту (`throttleApi`)
- Scheduler: `php artisan schedule:work`

systemd:

- `/etc/systemd/system/helphomes-api-queue.service` — `queue:work redis --sleep=1 --tries=3 --max-time=3600`, `Restart=always`, `MemoryMax=192M`
- `/etc/systemd/system/helphomes-api-scheduler.service` — `schedule:work`, `Restart=always`, `MemoryMax=96M`

Оба unit активны и включены в `multi-user.target`.

## HTTPS и DNS

Записи на NS Beget уже указывают на сервер:

- `helphomes.ru A` → `93.189.229.117` (`@ns1.beget.com`)
- `api.helphomes.ru A` → `93.189.229.117` (`@ns1.beget.com`)

Публичные резолверы (`8.8.8.8`, `1.1.1.1`) и реестр `.ru` (RIPN) пока отвечают NXDOMAIN: домен не делегирован. Certbot не запускался повторно, чтобы не жечь лимиты Let's Encrypt.

После делегирования, только для этих имён:

```bash
cd /opt/rinulik/infra
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --no-deps \
  -d helphomes.ru -d api.helphomes.ru \
  --email admin@helphomes.ru --agree-tos --no-eff-email --non-interactive
```

Затем добавить 443-блоки в `helphomes.ru.conf` и `nginx -s reload` в контейнере. Автопродление существующего `rinulik-certbot-1` не отключалось.

## API v1

Единый JSON. Коллекции пока пустые.

| Метод | Путь | Ответ |
| --- | --- | --- |
| GET | `/api/v1/health` | `{ data: { service, status, checks: { app, database, redis } } }` |
| GET | `/api/v1/categories` | `{ data: [], meta: { current_page, per_page, total, last_page } }` |
| GET | `/api/v1/listings` | то же, пустая коллекция |
| GET | `/api/v1/listings/{id}` | `{ error: { code: "not_found", message, status: 404 } }` |

Проверено локально и через edge Host:

- health: `status=ok`, `app/database/redis=true`, без env/ключей
- listings?per_page=0 → `422 validation_error`
- `/.env` → 403, `/storage` `/vendor` → 404

Ошибки API: `validation_error`, `not_found`, `http_error`. Health не печатает конфигурацию.

## Авторизация и CORS

- Laravel Sanctum установлен.
- `statefulApi()` включён для будущей cookie/session-модели Next.js на `helphomes.ru` / `api.helphomes.ru`.
- Origins: `https://helphomes.ru`, `https://www.helphomes.ru`, `http://localhost:3100`, `http://127.0.0.1:3100`.
- `supports_credentials=true`, CORS `*` нет.
- Проверка: Origin `https://helphomes.ru` получает `Access-Control-Allow-Origin` и `Allow-Credentials`; чужой origin заголовок не получает.
- Trust proxies: `*`, чтобы после HTTPS работал `X-Forwarded-Proto`.
- Демо-аккаунты в production не создавались.

## Интеграция Next.js

Типизированный клиент: `src/lib/api.ts`.

- Браузер: `NEXT_PUBLIC_API_URL=https://api.helphomes.ru`
- SSR: `API_INTERNAL_URL=http://127.0.0.1:8073`
- Подключено на `/about`: health, категории, объявления. Дизайн остальных страниц не менялся.
- Локальные справочники и DEMO-режим сохранены. Production: `UI_DEMO_MODE=false`.

Релиз frontend: `/var/www/helphomes.ru/releases/20261101T205800Z`. Откат: `previous` → `20261101T203613Z`.

Проверенные маршруты frontend (Host `helphomes.ru`): `/`, `/map`, `/search`, `/catalog`, `/account`, `/account/partner`, `/favorites`, `/messages`, `/about` — все 200.

## Очереди и планировщик

| Unit | Команда | Автоперезапуск |
| --- | --- | --- |
| `helphomes-api-queue` | `artisan queue:work redis` | always, 3s |
| `helphomes-api-scheduler` | `artisan schedule:work` | always, 5s |

Проверено: `systemctl is-active` = active для обоих.

## Тесты

На сервере, из `/var/www/helphomes-api` от root (пользователь приложения не может spawn process):

```
php artisan test
```

7 passed (24 assertions), в том числе `Tests\Feature\ApiV1Test`:

- health без секретов
- пустые категории и объявления
- 404-конверт
- 422 на невалидный `per_page`

Также выполнено:

- `php artisan about` — Laravel 13.39.0, PHP 8.3.6, debug OFF, cache/queue redis, db pgsql
- `php artisan route:list --path=api` — 4 маршрута v1
- `php artisan migrate:status` — 3 миграции Ran
- `php artisan optimize` — config/routes/views закэшированы

`php artisan test` от `helphomes-api` падает с `posix_spawn Permission denied` (nologin / NoNewPrivileges). Это ограничение пользователя, не теста.

## Безопасность

- `APP_DEBUG=false`
- отдельный UNIX-пользователь и FPM-пул
- БД не на shared `rinulik-db`, не superuser
- Redis не слушает внешний интерфейс
- `.env` вне document root и закрыт Nginx
- CORS без `*` + credentials
- rate limit 60/мин
- логи приложения не содержат паролей (секреты не печатались в journal)
- чужие vhost и compose-сервисы не пересоздавались

## Изменённые файлы

### Сервер (новые)

- `/var/www/helphomes-api/**`
- `/etc/php/8.3/fpm/pool.d/helphomes-api.conf`
- `/etc/nginx/sites-available/helphomes-api.conf`
- `/etc/systemd/system/helphomes-api-queue.service`
- `/etc/systemd/system/helphomes-api-scheduler.service`
- Docker volume `helphomes-pgdata`, контейнер `helphomes-postgres`

### Сервер (правка только helphomes)

- `/opt/rinulik/infra/nginx/helphomes.ru.conf` — добавлен HTTP-блок `api.helphomes.ru`
- `/var/www/helphomes.ru/shared/.env` — `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`
- новый релиз Next.js `20261101T205800Z`

### Репозиторий

- `deploy/helphomes-api.fpm.conf`
- `deploy/helphomes-api.host-nginx.conf`
- `deploy/api.helphomes.ru.edge.conf`
- `deploy/helphomes-api-queue.service`
- `deploy/helphomes-api-scheduler.service`
- `deploy/laravel/*` (контроллеры, resources, cors, bootstrap, тесты)
- `src/lib/api.ts`
- `src/app/about/page.tsx` (служебная строка API, без смены макета)
- `docs/LARAVEL-INSTALLATION.md`

Не изменялись: дизайн каталога/карты/кабинета, `docker-compose.yml` других проектов, `www.conf`, rinulik DB.

## Архитектура следующих модулей

Каркас готов. Реализацию делать по одному модулю, после согласования схемы:

- пользователи и профили (Sanctum);
- компании и продавцы;
- категории и характеристики;
- объявления;
- фото/видео и S3;
- избранное, сообщения, уведомления;
- геолокация, поиск и фильтры;
- модерация и жалобы;
- реклама, платежи;
- административная панель.

В БД: стандартные таблицы Laravel плюс `categories` (226 узлов из `taxonomy.json`) и пустая `listings`.

## Каталог в API (этап 2)

- `GET /api/v1/categories` — 226 опубликованных разделов, фильтры `parent=root` и `path`.
- `GET /api/v1/categories/{id}` — один раздел.
- `GET /api/v1/listings` — только `status=published`. Сейчас пусто, демо-карточки в production не создавались.
- Каталог Next.js сначала спрашивает API; если объявлений нет, остаётся локальный DEMO-режим.
- Главная, карта и кабинет по дизайну не менялись.
- Релиз frontend: `20261101T224700Z`.
- Временный вход: `https://avito.rinulik.ru`. API на том же хосте: `/api/v1/*`.

`php artisan test`: 8 passed (29 assertions) на sqlite. Production-конфиг перед тестами сбрасывается, чтобы RefreshDatabase не задел PostgreSQL.

## Оставшиеся задачи

1. Зарегистрировать `helphomes.ru` в реестре .ru, затем переключить vhost и `APP_URL` с временного `avito.rinulik.ru`.
2. В кабинете Яндекса добавить HTTP Referer `avito.rinulik.ru` (и позже `helphomes.ru`).
3. Публикация объявлений и пользователей через API, без демо-аккаунтов.
4. Не реализовывать всю бизнес-схему одним шагом.
