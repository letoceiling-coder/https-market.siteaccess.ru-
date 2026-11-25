# Карта объявлений — реализация

## Решение

`/map` использует **официальный Яндекс Карты JavaScript API 3.0** (`https://api-maps.yandex.ru/v3/`).

Leaflet / OSM с маршрута карты убраны. Без валидного ключа с ограничением HTTP Referer показывается честный setup-state «Требуется настройка Яндекс Карт» — список и bottom sheet при этом работают. Подмена тайлами другого провайдера или iframe запрещена.

Подробности лицензии и ключа: `docs/YANDEX-MAPS.md`.

## Архитектура

| Компонент | Роль |
|---|---|
| `YandexMapProvider` | Контекст наличия ключа |
| `YandexMapView` | Динамический `next/dynamic` (`ssr: false`), загрузка SDK только на `/map` |
| `MapListingMarker` / `MapCluster` | Маркеры цены и кластеры (`@yandex/ymaps3-clusterer`) |
| `MapControls` | Zoom / геолокация / тип карты |
| `MapSearchArea` | Поиск в видимой области |
| `MapFilterBar` | Поиск + быстрые чипы |
| `MapListingPreview` | Компактный предпросмотр |
| `MapResultsSheet` | Collapsed / Half / Expanded |
| `MapListToggle` | Карта ↔ Список |
| `MapScreen` | Оркестрация desktop/mobile |

Координаты API: `[lng, lat]`. URL: `lat`, `lng`, `z` (+ `kind`, `region`). Конвертация на границе `lib/yandex-maps.ts`.

## Данные и регион

- Точки только с реальными координатами; без координат пин не ставится.
- `matchesRegion` / `getRegionCentre` — смена региона переносит карту и сужает выборку.
- DEMO-точки помечены DEMO; без `UI_DEMO_MODE` публичная лента не получает фиктивные коммерческие объявления.

## Mobile UX

- Глобальная `SiteHeader` на `/map` скрыта (`lg` — видна для двухпанельного desktop).
- Компактный chrome: Назад / «Карта» / Список → поиск → чипы.
- Карта занимает оставшееся пространство; sheet collapsed ≈80–110 px.
- Bottom nav остаётся; контент учитывает `env(safe-area-inset-bottom)`.

## Производительность

- Карта не пересоздаётся на каждый чип-фильтр.
- Ограничение маркеров на канвасе (slice).
- Положение в `sessionStorage` (`hh.map.view`) + URL `replaceState`.

## Файлы

- `src/app/map/page.tsx`
- `src/components/map/*`
- `src/lib/yandex-maps.ts`
- `src/services/map-data.ts`, `src/services/region.ts`
