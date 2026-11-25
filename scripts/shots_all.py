"""Capture a list of (name, path, width, height, mobile) in parallel with scripts/shot.py."""
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

BASE = "http://localhost:3000"
OUT = sys.argv[1] if len(sys.argv) > 1 else ".sheets"
only = set(sys.argv[2:])

JOBS = [
    ("home-1600", "/", 1600, 900, False),
    ("home-1600-full", "/", 1600, 2300, False),
    ("catalog-1600", "/catalog/transport/legkovye", 1600, 900, False),
    ("catalog-index-1600", "/catalog", 1600, 1500, False),
    ("search-1600", "/search?q=%D0%B4%D0%B8%D0%B2%D0%B0%D0%BD", 1600, 900, False),
    ("card-1600", "/samples/car-coupe", 1600, 1200, False),
    ("favorites-1600", "/favorites", 1600, 700, False),
    ("home-360", "/", 360, 800, True),
    ("home-390", "/", 390, 844, True),
    ("home-430", "/", 430, 932, True),
    ("home-390-full", "/", 390, 2400, True),
    ("catalog-390", "/catalog/nedvizhimost/kvartiry", 390, 844, True),
    ("card-390", "/samples/car-coupe", 390, 1300, True),
    ("search-390", "/search?q=%D0%B4%D0%B8%D0%B2%D0%B0%D0%BD", 390, 844, True),
    ("publish-1600", "/account/partner/listings/new", 1600, 900, False),
    ("cabinet-1600", "/account/partner", 1600, 900, False),
    ("companies-1600", "/partners", 1600, 900, False),
    ("services-1600", "/services", 1600, 900, False),
]


def run(job):
    name, path, width, height, mobile = job
    args = ["python", "scripts/shot.py", BASE + path, str(width), str(height), f"{OUT}/{name}.png"]
    if mobile:
        args.append("mobile")
    subprocess.run(args, capture_output=True, timeout=180)
    return name


jobs = [job for job in JOBS if not only or job[0] in only]
with ThreadPoolExecutor(max_workers=4) as pool:
    for name in pool.map(run, jobs):
        print("done", name)
