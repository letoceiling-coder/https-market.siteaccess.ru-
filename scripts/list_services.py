import json

services = json.load(open("src/data/services.json", encoding="utf-8"))
for item in services:
    print(item["categoryId"], item["slug"], item["name"], sep=" | ")
