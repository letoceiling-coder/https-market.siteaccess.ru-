import json
from pathlib import Path

root = Path("src/data")
services = json.loads((root / "services.json").read_text(encoding="utf-8"))
changed = []
for item in services:
    if item["imageId"] == "pipes-yard":
        item["imageId"] = "pipes"
        changed.append(item["slug"])
(root / "services.json").write_text(json.dumps(services, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

articles = json.loads((root / "articles.json").read_text(encoding="utf-8"))
for item in articles:
    if item.get("imageId") == "pipes-yard":
        item["imageId"] = "pipes"
        changed.append(item["slug"])
(root / "articles.json").write_text(json.dumps(articles, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("changed", ", ".join(changed))
