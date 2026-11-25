"""Category and demo photos. Unsplash License. Author is not guessed."""

from __future__ import annotations

import io
import json
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media"
DATA = ROOT / "src" / "data" / "media.json"

PHOTOS = [
    ("tile-auto", "photo-1492144534655-ae79c964c9d7", "Серый легковой автомобиль спереди"),
    ("tile-auto-side", "photo-1503376780353-7e6692767b70", "Серебристый автомобиль сбоку"),
    ("tile-flat", "photo-1502672260266-1c1ef2d93688", "Светлая гостиная квартиры"),
    ("tile-kitchen", "photo-1484154218962-a197022b5858", "Кухня в квартире"),
    ("tile-travel", "photo-1522708323590-d24dbb6b0267", "Комната с кроватью у окна"),
    ("tile-sofa", "photo-1555041469-a586c61ea9bc", "Диван в гостиной"),
    ("tile-parts", "photo-1486262715619-67b85e0b08d3", "Моторный отсек автомобиля"),
    ("tile-tools", "photo-1530124566582-a618bc2615dc", "Ручные инструменты"),
    ("tile-phone", "photo-1511707171634-5f897ff02aa9", "Смартфон"),
    ("tile-office", "photo-1497366216548-37526070297c", "Пустой офис со столами"),
    ("tile-laptop", "photo-1516387938699-a93567ec168e", "Ноутбук и блокнот"),
    ("tile-clothes", "photo-1445205170230-053b83016050", "Одежда на вешалках"),
    ("tile-toys", "photo-1566576912321-d58ddd7a6088", "Детские игрушки"),
    ("tile-bike", "photo-1485965120184-e220f721d03e", "Велосипед"),
    ("tile-dog", "photo-1587300003388-59208cc962cb", "Собака"),
    ("tile-beauty", "photo-1522335789203-aabd1fc54bc9", "Косметика и кисти"),
    ("tile-gift", "photo-1513885535751-8b9238bd345a", "Подарочные коробки"),
    ("tile-cafe", "photo-1554118811-1e0d58224f24", "Интерьер кафе"),
    ("tile-wardrobe", "photo-1595428774223-ef52624120d2", "Деревянный шкаф"),
]


def download(photo_id: str) -> bytes:
    url = f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=1600&q=80"
    request = urllib.request.Request(url, headers={"User-Agent": "HELP-HOMES-frontend/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        if "image" not in response.headers.get("content-type", ""):
            raise RuntimeError(photo_id)
        return response.read()


def main() -> None:
    assets = json.loads(DATA.read_text(encoding="utf-8"))
    known = {item["id"] for item in assets}
    for item_id, photo, alt in PHOTOS:
        if item_id in known:
            print("skip", item_id)
            continue
        raw = download(photo)
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        width, height = image.size
        if width > 1400:
            height = round(height * (1400 / width))
            width = 1400
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(OUT / f"{item_id}.webp", format="WEBP", quality=78, method=6)
        assets.append(
            {
                "id": item_id,
                "src": f"/media/{item_id}.webp",
                "width": width,
                "height": height,
                "alt": alt,
                "license": "Unsplash License",
                "licenseUrl": "https://unsplash.com/license",
                "author": "Unsplash",
                "authorUrl": "https://unsplash.com",
                "sourceUrl": f"https://images.unsplash.com/{photo}",
                "cdn": f"https://images.unsplash.com/{photo}",
                "verified": "Unsplash CDN image response. Photographer name is not stored because it was not verified.",
            }
        )
        print("saved", item_id, width, height)
    DATA.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
