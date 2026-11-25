"""Point every catalog image at a subject that matches the card."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"

SERVICE = {
    "ustanovka-santehniki": "bathroom",
    "razvodka-trub": "pipes",
    "smesiteli": "bathroom",
    "installyatsii": "bathroom",
    "ustranenie-protechek": "pipes",
    "remont-santehniki": "bathroom",
    "skvazhiny": "well-garden",
    "kolodtsy": "well-pump",
    "vvod-vody": "pipes",
    "nasosnye-stantsii": "well-pump",
    "filtratsiya": "pipes",
    "avtomatika-vody": "well-garden",
    "nakopiteli": "pipes-yard",
    "kotelnye": "heat-radiator",
    "radiatory": "heat-radiator",
    "tyoplye-poly": "heat-window",
    "kotly": "heat-window",
    "teplovye-nasosy": "heat-radiator",
    "avtomatizatsiya-otopleniya": "heat-window",
    "vnutrennyaya-kanalizatsiya": "pipes",
    "naruzhnaya-kanalizatsiya": "pipes-yard",
    "septiki": "pipes-yard",
    "stantsii-ochistki": "treatment",
    "drenazh": "pipes",
    "obsluzhivanie-kanalizatsii": "treatment",
    "provodka": "wires",
    "elektricheskie-shchity": "elec-box",
    "osveshchenie": "switch",
    "zazemlenie": "wires",
    "rezervnoe-pitanie": "elec-box",
    "diagnostika-elektriki": "wires",
    "avtomatika-elektriki": "switch",
    "proekt-gaza": "gas-meter",
    "soglasovanie-gaza": "gas-meter",
    "podklyuchenie-gaza": "gas-meter",
    "gazovoe-oborudovanie": "gas-meter",
    "gazovye-kotelnye": "gas-meter",
    "diagnostika-gaza": "gas-meter",
    "split-sistemy": "ac-row",
    "multisplit": "ac-wall",
    "kanalnye-konditsionery": "ac-row",
    "promyshlennye-sistemy": "ac-wall",
    "montazh-konditsionerov": "ac-row",
    "servis-konditsionerov": "ac-wall",
    "proektirovanie-klimata": "ac-row",
    "pritochnaya": "vent-roof",
    "vytyazhnaya": "vent-roof",
    "rekuperatsiya": "vent-roof",
    "vozduhovody": "vent-roof",
    "promyshlennaya-ventilyatsiya": "vent-roof",
    "balansirovka": "vent-roof",
    "fundamenty": "construction",
    "karkas": "house-wood",
    "gazobeton": "house-concrete",
    "kirpich": "house-brick",
    "monolit": "stone-house",
    "krovlya": "vent-roof",
    "uteplenie": "house-door",
    "proekty-domov": "house-lake",
    "planirovka-uchastka": "field",
    "blagoustroystvo": "house-lawn",
    "ozelenenie": "house-trees",
    "avtopoliv": "well-garden",
    "dorozhki": "house-field",
    "podsvetka-uchastka": "house-door",
    "drenazh-uchastka": "pipes-yard",
    "chernovye-raboty": "stone-house",
    "chistovaya-otdelka": "kitchen-marble",
    "fasady": "house-brick",
    "sanuzly": "bathroom",
    "potolki": "kitchen-wood",
    "poly": "kitchen",
    "remont-pod-klyuch": "kitchen-marble",
    "upravlenie-osveshcheniem": "switch",
    "klimat-umnyy-dom": "ac-wall",
    "okhrana": "elec-box",
    "datchiki": "switch",
    "stsenarii": "wires",
    "upravlenie-smartfonom": "switch",
    "integratsii": "wires",
}

CATEGORY = {
    "santehnika": "bathroom",
    "vodosnabzhenie": "well-pump",
    "otoplenie": "heat-radiator",
    "kanalizatsiya": "pipes",
    "elektrika": "elec-box",
    "konditsionirovanie": "ac-row",
    "ventilyatsiya": "vent-roof",
    "gazifikatsiya": "gas-meter",
    "stroitelstvo": "construction",
    "landshaft": "house-lawn",
    "otdelka": "kitchen",
    "umnyy-dom": "switch",
}

ARTICLE = {
    "istochnik-tepla": "heat-radiator",
    "septik-ili-stanciya": "pipes-yard",
    "vvod-elektrichestva": "elec-box",
    "skvazhina-ili-kolodec": "well-pump",
    "ventilyatsiya-germetichnogo-doma": "vent-roof",
    "tipy-fundamentov": "construction",
    "uchastok-pered-pokupkoy": "field",
    "teplyy-pol-ogranicheniya": "heat-window",
}

PROPERTY = {
    "demo-odnoetazhnyy": ["stone-house", "house-door", "house-concrete"],
}


def load(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def save(name: str, value) -> None:
    (DATA / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    media = {item["id"] for item in load("media.json")}
    missing = [item for item in set(SERVICE.values()) | set(CATEGORY.values()) | set(ARTICLE.values()) if item not in media]
    for images in PROPERTY.values():
        missing.extend(item for item in images if item not in media)
    if missing:
        raise SystemExit(f"missing media: {sorted(set(missing))}")

    services = load("services.json")
    seen = {item["slug"] for item in services}
    unknown = sorted(set(SERVICE) - seen)
    if unknown:
        raise SystemExit(f"unknown slugs: {unknown}")
    unassigned = sorted(seen - set(SERVICE))
    if unassigned:
        raise SystemExit(f"unassigned: {unassigned}")
    for item in services:
        item["imageId"] = SERVICE[item["slug"]]
    save("services.json", services)

    categories = load("categories.json")
    for item in categories:
        item["imageId"] = CATEGORY[item["id"]]
    save("categories.json", categories)

    articles = load("articles.json")
    for item in articles:
        item["imageId"] = ARTICLE[item["slug"]]
    save("articles.json", articles)

    properties = load("properties.json")
    for item in properties:
        if item["slug"] in PROPERTY:
            item["imageIds"] = PROPERTY[item["slug"]]
    save("properties.json", properties)
    print("assigned", len(services), "services")


if __name__ == "__main__":
    main()
