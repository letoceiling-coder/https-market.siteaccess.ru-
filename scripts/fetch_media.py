"""Download verified Unsplash License photos and store optimized WebP locally.

Each record was checked against a public Unsplash photo or search page:
the file is served from images.unsplash.com (not plus.unsplash.com) and the
page offers a free download under the Unsplash License. Unsplash+ items were
excluded. Attribution is kept even though the license does not require it.
"""

from __future__ import annotations

import io
import json
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media"
DATA = ROOT / "src" / "data" / "media.json"

LICENSE = "Unsplash License"
LICENSE_URL = "https://unsplash.com/license"

PHOTOS = [
    {
        "id": "house-concrete",
        "photo": "photo-1595222016771-1843541fa718",
        "alt": "Светлый дом с бетонными и деревянными фасадами",
        "author": "Brittney In Beta",
        "authorUrl": "https://unsplash.com/@brittneyinbeta",
        "pageUrl": "https://unsplash.com/photos/white-and-brown-concrete-house-q0-1FzvJpjY",
    },
    {
        "id": "house-wood",
        "photo": "photo-1529781833076-5f422f69d1af",
        "alt": "Деревянный дом среди деревьев",
        "author": "Milan Seitler",
        "authorUrl": "https://unsplash.com/@milanseitler",
        "pageUrl": "https://unsplash.com/photos/gray-wooden-house-on-forest-2WvijgM7uTo",
    },
    {
        "id": "house-glass",
        "photo": "photo-1519999933293-fb5e79c3e9b3",
        "alt": "Стеклянная дверь в белой раме современного дома",
        "author": "Bernard Hermant",
        "authorUrl": "https://unsplash.com/@bernardhermant",
        "pageUrl": "https://unsplash.com/photos/clear-glass-door-in-white-frame-uQNmPscyWg0",
    },
    {
        "id": "house-trees",
        "photo": "photo-1610429576656-0f0278e98a2e",
        "alt": "Дом у деревьев под открытым небом",
        "author": "Ismael Paramo",
        "authorUrl": "https://unsplash.com/@ismaelparamo",
        "pageUrl": "https://unsplash.com/photos/brown-and-white-concrete-house-near-bare-trees-under-blue-sky-during-daytime-tbUmoLalVpo",
    },
    {
        "id": "house-field",
        "photo": "photo-1713593931131-bc6b2905dcca",
        "alt": "Небольшой светлый дом посреди поля",
        "author": "Nik",
        "authorUrl": "https://unsplash.com/@helloimnik",
        "pageUrl": "https://unsplash.com/photos/a-small-white-house-in-the-middle-of-a-field-2s50qZ0bEqM",
    },
    {
        "id": "house-lake",
        "photo": "photo-1586090097830-147b7f2be946",
        "alt": "Деревянный дом у воды в окружении деревьев",
        "author": "Danny Giebe",
        "authorUrl": "https://unsplash.com/@solonomade",
        "pageUrl": "https://unsplash.com/photos/brown-wooden-house-near-lake-surrounded-by-trees-during-daytime-2ASwewGVSPE",
    },
    {
        "id": "house-brick",
        "photo": "photo-1566870360032-259aa700570c",
        "alt": "Двухэтажный кирпичный дом днём",
        "author": "Irene Rego",
        "authorUrl": "https://unsplash.com/@irene_rego",
        "pageUrl": "https://unsplash.com/photos/brown-bricked-2-story-house-during-daytime-4I2gvtDOhrc",
    },
    {
        "id": "house-lawn",
        "photo": "photo-1592595896616-c37162298647",
        "alt": "Дом с газоном и благоустройством перед фасадом",
        "author": "Ronnie George",
        "authorUrl": "https://unsplash.com/@realestateron",
        "pageUrl": "https://unsplash.com/photos/brown-and-white-concrete-house-z11gbBo13ro",
    },
    {
        "id": "house-door",
        "photo": "photo-1731259240474-5370d9ca53ba",
        "alt": "Дом с красной дверью и зелёным газоном",
        "author": "Keenan Shepard",
        "authorUrl": "https://unsplash.com/@oltaire",
        "pageUrl": "https://unsplash.com/photos/a-house-with-a-red-door-and-a-green-lawn-vOQDS6AmwrM",
    },
    {
        "id": "bathroom",
        "photo": "photo-1584622650111-993a426fbf0a",
        "alt": "Современная ванная комната с душем и тумбой",
        "author": "Lotus Design N Print",
        "authorUrl": "https://unsplash.com/@lotusdnp",
        "pageUrl": "https://unsplash.com/photos/modern-bathroom-with-shower-and-vanity-g51F6-WYzyU",
    },
    {
        "id": "kitchen",
        "photo": "photo-1757387240036-d7eb9b096c40",
        "alt": "Светлая кухня с белыми шкафами и техникой",
        "author": "Clay Banks",
        "authorUrl": "https://unsplash.com/@claybanks",
        "pageUrl": "https://unsplash.com/photos/bright-modern-kitchen-with-white-cabinets-and-stainless-steel-appliances-nTqR3B3dp-Q",
    },
    {
        "id": "kitchen-wood",
        "photo": "photo-1774427760495-393961affbde",
        "alt": "Кухня с деревянными столешницами и светлыми фасадами",
        "author": "Aleksandra Dementeva",
        "authorUrl": "https://unsplash.com/@alexphotogram",
        "pageUrl": "https://unsplash.com/photos/modern-white-kitchen-with-wooden-countertops-and-terrazzo-backsplash-eqQzyYdizkE",
    },
    {
        "id": "kitchen-marble",
        "photo": "photo-1722605090433-41d1183a792d",
        "alt": "Кухня с белыми шкафами и каменной столешницей",
        "author": "Zac Gudakov",
        "authorUrl": "https://unsplash.com/@zacgudakov",
        "pageUrl": "https://unsplash.com/photos/a-kitchen-with-white-cabinets-and-marble-counter-tops-rjjAKAp0KSw",
    },
    {
        "id": "field",
        "photo": "photo-1526392587392-d1627b6c134a",
        "alt": "Открытое зелёное поле",
        "author": "Alexander Grey",
        "authorUrl": "https://unsplash.com/@sharonmccutcheon",
        "pageUrl": "https://unsplash.com/photos/green-grass-field-fSlCxR0dnZY",
    },
    {
        "id": "construction",
        "photo": "photo-1579847188804-ecba0e2ea330",
        "alt": "Силуэт башенного крана на стройке",
        "author": "Shivendu Shukla",
        "authorUrl": "https://unsplash.com/@shivendushukla",
        "pageUrl": "https://unsplash.com/photos/silhouette-of-people-standing-on-tower-crane-during-night-time-3yoTPuYR9ZY",
    },
    {
        "id": "stone-house",
        "photo": "photo-1701852691007-1cc113beaf29",
        "alt": "Каменный дом с калиткой",
        "author": "Ibrahim guetar",
        "authorUrl": "https://unsplash.com/@himo_beast1996",
        "pageUrl": "https://unsplash.com/photos/an-old-stone-house-with-a-gate-in-front-of-it-uxzstMshhB8",
    },
]


def download(photo_id: str) -> bytes:
    url = f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=1800&q=80"
    request = urllib.request.Request(url, headers={"User-Agent": "HELP-HOMES-frontend/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        content_type = response.headers.get("content-type", "")
        if "image" not in content_type:
            raise RuntimeError(f"Unexpected content type for {photo_id}: {content_type}")
        return response.read()


def save_webp(raw: bytes, path: Path, max_width: int) -> tuple[int, int]:
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = image.size
    if width > max_width:
        next_height = round(height * (max_width / width))
        image = image.resize((max_width, next_height), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="WEBP", quality=78, method=6)
    return image.size


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    assets = []
    for item in PHOTOS:
        raw = download(item["photo"])
        filename = f"{item['id']}.webp"
        width, height = save_webp(raw, OUT / filename, 1600)
        assets.append(
            {
                "id": item["id"],
                "src": f"/media/{filename}",
                "width": width,
                "height": height,
                "alt": item["alt"],
                "license": LICENSE,
                "licenseUrl": LICENSE_URL,
                "author": item["author"],
                "authorUrl": item["authorUrl"],
                "sourceUrl": item["pageUrl"],
                "cdn": f"https://images.unsplash.com/{item['photo']}",
                "verified": "Free download on Unsplash, not Unsplash+",
            }
        )
        print(f"saved {filename} {width}x{height}")
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {DATA}")


if __name__ == "__main__":
    main()
