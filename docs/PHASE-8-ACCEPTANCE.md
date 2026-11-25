# Phase 8 — приёмка UX и Яндекс Карт

Дата проверки: 24.11.2026. Dev: `localhost:3000`. Production build: успешно.

## Сделано

- Визуальный аудит с измерениями: `docs/AVITO-VISUAL-GAP-AUDIT.md` (+ блок «Статус после Phase 8»)
- Мобильная главная 320×579: шапка 97 px, регион «Россия», поиск + каталог, плитки 136×64, заголовки карточек `line-clamp: 2` (36 px)
- Категории: Авто, Недвижимость, Аренда, Работа, Услуги, Электроника, Одежда, Дом и дача, Запчасти, Животные, Детские товары, Спорт, Бизнес, Строительство + «Все категории»
- Регион сужает ленту (`RegionFeed`), каталог и карту. Коми / Сыктывкар в справочнике. Без координат объявление не ставится в произвольную точку
- Leaflet/OSM убраны с `/map`. Без ключа — «Требуется настройка Яндекс Карт». Список и bottom sheet работают
- Мобильная карта: глобальная шапка скрыта, компактный chrome (Назад / Карта / Список), sheet collapsed ≈96 px
- Фильтры: чипы + полноэкран («Назад» / «Фильтры» / «Сбросить» + «Показать результаты»), значения в URL
- Карточка объявления: компактный chrome, sticky-действия без нижней навигации на `/samples/*`
- Crumbs и MapScreen без hydration mismatch (`useSyncExternalStore`)
- Production build: exit 0

## Измерения после (320×579)

| Экран | Факт |
|---|---|
| Главная шапка | 97×320, регион «Россия» |
| Плитка категории | 136×64; две колонки целиком, третья выглядывает |
| Карточка ленты | ~142×259, заголовок 36 px / 2 строки |
| Карта | site header display:none; «Список» y≈8; sheet 96 px (t=427); setup-state=true; leaflet=false |

Скриншоты: `docs/screenshots/phase8-before-home-320.png`, `phase8-before-map-320.png`, `phase8-after-home-320.png`, `phase8-after-map-320.png`.

## Ограничения

- Живой SDK Яндекс Карт не подтверждён: `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` с HTTP Referer не задан. Тесты без ключа не считаются проверкой тайлов и кластеров.
- Playwright: `e2e/phase8.spec.ts` (нужны `npx playwright install` при первом запуске).
- Деплой не выполнялся. Платные вызовы Геокодера не включались.

## Изменённые поверхности (эта итерация)

- `src/components/classified/category-mosaic.tsx` — карусель 136×64, расширенный набор категорий
- `src/components/site/header.tsx` — двухуровневая mobile-шапка; скрытие на `/map`
- `src/components/map/map-screen.tsx` — full-bleed mobile chrome, lint-safe flyTo/region
- `src/components/site/crumbs.tsx` — клиентский responsive без dual-tree hydration
- `src/components/classified/listing-card.tsx`, `src/app/page.tsx`, filters, messages — ранее в Phase 8
