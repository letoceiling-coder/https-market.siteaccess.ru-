"""Headless Chrome screenshot at an exact CSS viewport size.

usage: python scripts/shot.py <url> <width> <height> <out.png> [mobile]

Headless Chrome refuses windows narrower than ~500px, so narrow viewports are rendered
inside an iframe of the exact size (media queries follow the iframe width) and cropped.
Images are lazy, so a virtual time budget lets them load before capture.
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

url, width, height, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
out = os.path.abspath(out)
workdir = tempfile.mkdtemp()
window_width = max(width, 600)

target = url
if width < 600:
    page = os.path.join(workdir, "frame.html")
    with open(page, "w", encoding="utf-8") as handle:
        handle.write(
            "<!doctype html><html><body style='margin:0;background:#fff'>"
            f"<iframe src='{url}' style='border:0;width:{width}px;height:{height}px;display:block'></iframe>"
            "</body></html>"
        )
    target = "file:///" + page.replace("\\", "/")

args = [
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    f"--user-data-dir={workdir}",
    f"--window-size={window_width},{height}",
    "--virtual-time-budget=15000",
    f"--screenshot={out}",
    target,
]
subprocess.run(args, check=False, capture_output=True, timeout=170)

if width < 600 and os.path.exists(out):
    image = Image.open(out)
    image.crop((0, 0, width, min(height, image.height))).save(out)
print(out)
