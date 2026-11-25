"""Build labelled contact sheets of d-* photos to check relevance by eye."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media"
OUT = ROOT / ".sheets"
OUT.mkdir(exist_ok=True)

prefix = sys.argv[1] if len(sys.argv) > 1 else "d-"
per = int(sys.argv[2]) if len(sys.argv) > 2 else 20
ids = sorted(path.stem for path in MEDIA.glob(f"{prefix}*.webp"))
cols, cell_w, cell_h = 5, 300, 200
for page in range(0, len(ids), per):
    chunk = ids[page : page + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + 18)), "white")
    draw = ImageDraw.Draw(sheet)
    for index, item_id in enumerate(chunk):
        image = Image.open(MEDIA / f"{item_id}.webp").convert("RGB")
        image.thumbnail((cell_w - 4, cell_h))
        x = (index % cols) * cell_w + 2
        y = (index // cols) * (cell_h + 18)
        sheet.paste(image, (x, y + 18))
        draw.text((x, y + 2), item_id, fill="black")
    target = OUT / f"sheet-{page // per + 1}.jpg"
    sheet.save(target, quality=82)
    print(target)
