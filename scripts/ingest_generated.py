"""Turn generated media + scripts/gen_listings_spec.json into DEMO listings.

Input:  a folder with <slug>-<n>.png photos and <slug>.mp4 clips (from gen_media_comfy.js).
Output: public/media/g/*.webp, public/media/g/*.mp4, entries in src/data/media.json and
        src/data/demo/ui-demo-listings.json. Idempotent: previous g-* records are replaced.

Usage: python scripts/ingest_generated.py <generated_dir>
"""
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((ROOT / "scripts" / "gen_listings_spec.json").read_text(encoding="utf-8"))
MEDIA_JSON = ROOT / "src" / "data" / "media.json"
DEMOS_JSON = ROOT / "src" / "data" / "demo" / "ui-demo-listings.json"
OUT = ROOT / "public" / "media" / "g"
NOTE = "DEMO: тестовая карточка для проверки интерфейса. Это не объявление, не продавец и не реальная цена."


def main(src: Path):
    OUT.mkdir(parents=True, exist_ok=True)
    media = [m for m in json.loads(MEDIA_JSON.read_text(encoding="utf-8")) if not m["id"].startswith("g-")]
    demos = [d for d in json.loads(DEMOS_JSON.read_text(encoding="utf-8")) if not d["id"].startswith("demo-g-")]

    added = []
    for item in SPEC:
        gallery = []
        for i, _ in enumerate(item["photos"], start=1):
            png = src / f"{item['slug']}-{i}.png"
            if not png.exists():
                continue
            mid = f"{item['slug']}-{i}"
            webp = OUT / f"{mid}.webp"
            with Image.open(png) as im:
                im = im.convert("RGB")
                im.thumbnail((1216, 1216))
                im.save(webp, "WEBP", quality=80, method=6)
                w, h = im.size
            media.append({
                "id": mid, "src": f"/media/g/{mid}.webp", "width": w, "height": h,
                "alt": f"{item['title']}, фото {i}",
                "license": "Сгенерировано нейросетью (Z-Image Turbo)", "licenseUrl": "", "author": "HELP HOMES",
                "authorUrl": "", "sourceUrl": "", "cdn": "", "verified": "generated",
            })
            gallery.append(mid)
        if not gallery:
            print("skip, no photos:", item["slug"])
            continue
        video = None
        mp4 = src / f"{item['slug']}.mp4"
        if item.get("video") and mp4.exists():
            shutil.copyfile(mp4, OUT / mp4.name)
            video = {"src": f"/media/g/{mp4.name}", "poster": f"/media/g/{gallery[0]}.webp"}
        record = {
            "id": f"demo-{item['slug']}", "slug": item["slug"], "demo": True, "kind": item["kind"],
            "categoryPath": item["categoryPath"], "title": item["title"], "facts": item["facts"],
            "params": item["params"], "description": item["description"], "regionId": item["regionId"],
            "place": item["place"], "postedAt": item["postedAt"], "imageId": gallery[0], "gallery": gallery,
            "video": video, "price": item["price"] or None,
            "priceSuffix": (item.get("priceSuffix") or "").replace("₽ ", "").strip() or None,
            "priceLabel": "Даром" if item["price"] == 0 else "Цена не указана",
            "attributes": {k: v for k, v in item["attributes"].items() if v != ""}, "originNote": NOTE,
        }
        added.append(record)

    MEDIA_JSON.write_text(json.dumps(media, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    DEMOS_JSON.write_text(json.dumps(added + demos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"added {len(added)} listings, {sum(len(a['gallery']) for a in added)} photos, "
          f"{sum(1 for a in added if a['video'])} videos; total {len(added) + len(demos)} listings")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
