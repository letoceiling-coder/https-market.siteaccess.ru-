# UI reference audit: HELP HOMES vs. Avito composition (V5)

## How the numbers were obtained

- **Reference (Avito, avito.ru main page)** was measured on the live page with `getBoundingClientRect()` and
  `getComputedStyle()` in the Cursor browser, viewport emulated at **1600 × 900** (layout width 1585 px because of the
  15 px scrollbar). These are real measurements, not estimates. The page was logged out, region Санкт-Петербург,
  a promo banner (72 px) sat above the header and is not counted.
- **HELP HOMES** was measured the same way on the production build (`next build && next start`) at the same viewport.
- A pixel screenshot of the reference could not be stored: the browser's screenshot tool returns tiled crops for
  that tab. Numeric comparison is used instead; the "after" screenshots are in `docs/screenshots/`.
- No Avito logos, cut-out illustrations or text are reused. Only geometry and proportions were taken.

## 1. Measured spec

| Element | Avito (reference) | HELP HOMES before | HELP HOMES after |
|---|---|---|---|
| Content container | 1316 px (x 135 → 1451) | 1368 px (max 1400) | **1316 px (x 135 → 1451)** |
| Header: top service row | 22 px text row, 15 px type | 32 px, 13 px type | 40 px, 14 px type |
| Header: main row control height | 52 px (category button 163 × 52) | 44 px | **52 px (category button 168 × 52)** |
| Header total (no promo) | ≈ 114 px | 97 px | 117 px |
| Search field | input 665 px wide + button | ≈ 462 px | 612 px bar, 510 px input + «Найти» |
| Primary CTA | «Разместить объявление» 203 × 54 | icon + 72 px label | **215 × 52, text button** |
| Category tile | 204 × 102, radius 24, bg rgba(0,0,0,.04), padding 14/20 | 279 × 108, radius 16 | **240 × 102, radius 26, bg #f2f1f0** |
| Tile gap | 5–6 px | 8 px | **6 px** |
| Tile title | 15 px / 400 / 20.6 px | 16 px / 700 | 15 px / 500 / 21 px |
| Tile art | cut-out 3D object, 204 × 100 | photo under a gradient mask | **sharp photo, right 44 %, no gradient, no mask** |
| Business block | 300 px wide, ≈ 214 px tall (2 tile rows), 38 px from tiles | 220 × 340 | **300 × 318 (3 tile rows), 38 px from tiles** |
| Tiles → first card row | 36 px, no heading | 24 px + heading | 64 px (36 px + 28 px heading «Рекомендации для вас») |
| Card grid | 5 columns, 16 px gap (5 × 250 + 4 × 16 = 1314) | 5 × 264, 12 px gap | **5 × 250, 16 px gap** |
| Card photo | **250 × 250 square**, radius ≈ 16 | square | **250 × 250 square**, radius 17 |
| Card order | title → price → details | price → title | **title → price → facts → place → date** |
| Card title | 15 px / 400 / 20 px, one line | 15 px / 20 px, two lines | 15 px / 400 / 20 px, one line |
| Card price | 16 px / 700 / 20 px | 17 px / 700 | 16 px / 700 / 20 px |
| Photo → title offset | 7 px | 8 px | 7 px |

## 2. Differences kept on purpose

| Difference | Reason |
|---|---|
| 12 tiles in 3 rows × 4 columns (reference shows 10 tiles in 2 rows × 5 at 1600 and reveals more later) | The V5 brief fixes 12 tiles as 3 × 4 with the business block on the right. |
| Rectangular photos instead of cut-out 3D illustrations | The brief forbids protected graphics and asks for sharp relevant photos. |
| Reference tile widths vary (204 / 140) | Equal columns read cleaner and are easier to keep responsive. |
| Search input is 510 px, the reference is 665 px | HELP HOMES keeps a visible «Все категории» button and a 215 px CTA in the same 1316 px row. The region picker was moved to the service row to free space. |
| Font: Inter instead of Primary Sans | Primary Sans is proprietary. Inter has Cyrillic and similar metrics. |
| Header height 117 vs ≈ 114 px | Larger click targets in the service row. |
| DEMO badge on cards | Required: demo data must never look like real listings. |

## 3. Mobile (360 × 800, 390 × 844, 430 × 932)

The reference measurement above is desktop only. Mobile follows the V5 brief:

- compact header: logo, region, favourites, messages (48 px) and a full-width search button (44 px) that opens a
  full-screen search overlay with suggestions and a list of sections;
- categories: two rows that scroll horizontally, 172 × 76 tiles with snap;
- feed: 2 columns, square photos, job and service cards switch to list mode (photo left);
- bottom navigation 56 px with a raised «Разместить» button;
- listing page: full-bleed swipe gallery on native scroll-snap, price right under the title, fixed «Написать» bar.
