"""Add theme-matched Unsplash License photos. Each item showed a free Download, not Unsplash+."""

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
        "id": "heat-radiator",
        "photo": "photo-1669725341213-7379ff6c90d5",
        "alt": "Белый радиатор отопления в комнате",
        "author": "e24",
        "authorUrl": "https://unsplash.com/@e_heizung_24",
        "pageUrl": "https://unsplash.com/photos/a-white-radiator-in-a-room-N6KVqGA44ZI",
    },
    {
        "id": "heat-window",
        "photo": "photo-1599028274511-e02a767949a3",
        "alt": "Радиатор у деревянного окна",
        "author": "Julian Hochgesang",
        "authorUrl": "https://unsplash.com/@julianhochgesang",
        "pageUrl": "https://unsplash.com/photos/white-radiator-heater-beside-brown-wooden-window-ihx1LdtnGXw",
    },
    {
        "id": "ac-row",
        "photo": "photo-1568634697393-0165d25e7acb",
        "alt": "Наружные блоки кондиционеров на стене",
        "author": "Ashkan Forouzani",
        "authorUrl": "https://unsplash.com/@ashkfor121",
        "pageUrl": "https://unsplash.com/photos/four-outdoor-ac-unit-JUAVCUMY008",
    },
    {
        "id": "ac-wall",
        "photo": "photo-1693741535032-4c87dd35b191",
        "alt": "Белый наружный блок кондиционера на фасаде",
        "author": "Michal Balog",
        "authorUrl": "https://unsplash.com/@mikbutcher",
        "pageUrl": "https://unsplash.com/photos/a-white-air-conditioner-sitting-on-the-side-of-a-building-I_v6T6k4Xxk",
    },
    {
        "id": "well-pump",
        "photo": "photo-1644469757549-a82b610882fb",
        "alt": "Колодезный насос с шлангом",
        "author": "Se. Tsuchiya",
        "authorUrl": "https://unsplash.com/@s_tsuchiya",
        "pageUrl": "https://unsplash.com/photos/an-old-water-pump-with-a-hose-attached-to-it-XXcW3eLvZog",
    },
    {
        "id": "well-garden",
        "photo": "photo-1534641614095-6222aed9bdd6",
        "alt": "Насос скважины на участке",
        "author": "Fikri Rasyid",
        "authorUrl": "https://unsplash.com/@fikrirasyid",
        "pageUrl": "https://unsplash.com/photos/gray-deep-well-pump-surrounded-by-flowers-during-daytime-LJnRzbDFdI4",
    },
    {
        "id": "wires",
        "photo": "photo-1717096945404-e6f12be85849",
        "alt": "Электрические провода на стене",
        "author": "Jonas Gerlach",
        "authorUrl": "https://unsplash.com/@jonasgerlach",
        "pageUrl": "https://unsplash.com/photos/a-bunch-of-electrical-wires-are-attached-to-a-wall-WYsoOJnLyvo",
    },
    {
        "id": "switch",
        "photo": "photo-1613315622081-3b066dbe5d83",
        "alt": "Выключатель на светлой стене",
        "author": "Greg Bulla",
        "authorUrl": "https://unsplash.com/@gregbulla",
        "pageUrl": "https://unsplash.com/photos/white-and-black-switch-on-white-wall-Xlz-BS1BP_Q",
    },
    {
        "id": "gas-meter",
        "photo": "photo-1760886810583-dbb87686d08c",
        "alt": "Газовый счётчик на стене",
        "author": "Parth Mishra",
        "authorUrl": "https://unsplash.com/@parth0384",
        "pageUrl": "https://unsplash.com/photos/a-gas-meter-mounted-on-a-pale-green-wall-GtenqOzEZgU",
    },
    {
        "id": "pipes-yard",
        "photo": "photo-1676044984934-da3a5122685b",
        "alt": "Трубы на грунте",
        "author": "Jake Johnson",
        "authorUrl": "https://unsplash.com/@heyjakejohnson",
        "pageUrl": "https://unsplash.com/photos/a-pile-of-pipes-sitting-on-top-of-a-dirt-field-muulOYXLaxA",
    },
    {
        "id": "treatment",
        "photo": "photo-1742640582522-b96acd23457f",
        "alt": "Сооружения очистных: башни и инфраструктура",
        "author": "Dieter K",
        "authorUrl": "https://unsplash.com/@dieter_muenchen",
        "pageUrl": "https://unsplash.com/photos/cone-shaped-industrial-towers-stand-beneath-a-cloudy-sky-auNmt3_pHhw",
    },
    {
        "id": "vent-roof",
        "photo": "photo-1761667803892-af792edb43ba",
        "alt": "Вентиляционный выход на металлической кровле",
        "author": "Belov Sergey",
        "authorUrl": "https://unsplash.com/@belov7043",
        "pageUrl": "https://unsplash.com/photos/metal-roof-with-a-ventilation-vent-M0rIVjcWMkE",
    },
    {
        "id": "pipes",
        "photo": "photo-1560636201-c08c2b24e147",
        "alt": "Куча водопроводных труб и фитингов",
        "author": "Tania Melnyczuk",
        "authorUrl": "https://unsplash.com/@alphabetania",
        "pageUrl": "https://unsplash.com/photos/pile-of-gray-and-brown-water-pipes-fR47SivxkSM",
    },
    {
        "id": "elec-box",
        "photo": "photo-1761064039597-908570d50c23",
        "alt": "Открытый электрический шкаф на улице",
        "author": "Jerry Wei",
        "authorUrl": "https://unsplash.com/@findway_jerry",
        "pageUrl": "https://unsplash.com/photos/open-electrical-box-mounted-on-a-pole-outdoors-PT_hNlgqRMk",
    },
]


def download(photo_id: str) -> bytes:
    url = f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=1800&q=80"
    request = urllib.request.Request(url, headers={"User-Agent": "HELP-HOMES-frontend/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        if "image" not in response.headers.get("content-type", ""):
            raise RuntimeError(photo_id)
        return response.read()


def save_webp(raw: bytes, path: Path) -> tuple[int, int]:
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = image.size
    if width > 1600:
        height = round(height * (1600 / width))
        width = 1600
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    image.save(path, format="WEBP", quality=78, method=6)
    return image.size


def main() -> None:
    assets = json.loads(DATA.read_text(encoding="utf-8"))
    known = {item["id"] for item in assets}
    for item in PHOTOS:
        if item["id"] in known:
            continue
        raw = download(item["photo"])
        width, height = save_webp(raw, OUT / f"{item['id']}.webp")
        assets.append(
            {
                "id": item["id"],
                "src": f"/media/{item['id']}.webp",
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
        print("saved", item["id"], width, height)
    DATA.write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
