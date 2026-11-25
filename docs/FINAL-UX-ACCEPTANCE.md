# Приёмка UX — Phase 8

Актуальный протокол: **`docs/PHASE-8-ACCEPTANCE.md`**.  
Визуальный разрыв и замеры: **`docs/AVITO-VISUAL-GAP-AUDIT.md`**.  
Карта: **`docs/MAP-IMPLEMENTATION.md`**, **`docs/YANDEX-MAPS.md`**.

## Критерии брифа Phase 8

| Критерий | Статус |
|---|---|
| Категории не обрезаются на 320 px | **Закрыто.** Плитки 136×64, peek следующей колонки, «Все категории» |
| Текст не выходит за карточки | **Закрыто.** `line-clamp-2`, titleH 36 px |
| Карта занимает полезное пространство | **Закрыто.** Site header скрыт на `/map`; sheet collapsed 96 px |
| Bottom sheet не мешает управлению | **Закрыто.** Collapsed / half / expanded; «Список» в chrome |
| Регион и результаты совпадают | **Закрыто.** `matchesRegion` + центры Коми/Сыктывкар |
| Фильтры влияют на выборку + URL | **Закрыто.** FilterWorkspace, ClientForm / query |
| Навигация без document reload | **Закрыто** (Phase 6 Link / prefetch / loading) |
| Нижняя панель не перекрывает контент | **Закрыто.** `/samples/*` без bottom nav; map учитывает inset |
| Карты не подменяются скриншотами/OSM | **Закрыто.** Setup-state без ключа; Yandex JS API 3.0 |
| Build / lint / screenshots | **Закрыто.** Build exit 0; after-скриншоты 320 px |

## Ограничения

- Живые тайлы Яндекс Карт не проверены без ключа с HTTP Referer.
- Деплой не выполнялся.
- Платные Геокодер-вызовы не включались.
