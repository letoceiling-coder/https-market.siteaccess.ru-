"""Download candidate demo photos in parallel. Unsplash CDN, Unsplash License. Failures are skipped."""

from __future__ import annotations

import io
import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media"
DATA = ROOT / "src" / "data" / "media.json"
CANDIDATES = ROOT / "scripts" / "demo_photo_candidates.json"


def fetch(item: dict) -> tuple[str, bytes | None]:
    url = f"https://images.unsplash.com/{item['photo']}?auto=format&fit=crop&w=1100&q=78"
    request = urllib.request.Request(url, headers={"User-Agent": "HELP-HOMES-frontend/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            if "image" not in response.headers.get("content-type", ""):
                return item["id"], None
            return item["id"], response.read()
    except Exception as error:  # noqa: BLE001
        print("fail", item["id"], error)
        return item["id"], None


def main() -> None:
    items = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    assets = json.loads(DATA.read_text(encoding="utf-8"))
    known = {entry["id"] for entry in assets}
    todo = [item for item in items if item["id"] not in known]
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(fetch, todo))
    by_id = {item["id"]: item for item in todo}
    for item_id, raw in results:
        if raw is None:
            continue
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        width, height = image.size
        image.save(OUT / f"{item_id}.webp", format="WEBP", quality=76, method=6)
        photo = by_id[item_id]["photo"]
        assets.append(
            {
                "id": item_id,
                "src": f"/media/{item_id}.webp",
                "width": width,
                "height": height,
                "alt": by_id[item_id]["alt"],
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
    sys.stdout.flush()


if __name__ == "__main__":
    main()
