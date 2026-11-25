"""Build the classified directory. Nodes are a reference taxonomy, not live ads."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "taxonomy.json"
DEMOS = ROOT / "src" / "data" / "classified-demos.json"

REFERENCE = "Справочный раздел каталога. Живых объявлений здесь нет, пока они не пройдут модерацию."


def opt(pairs):
    return [{"id": key, "name": name} for key, name in pairs]


def attr(key, name, kind, required, options):
    return {
        "id": key,
        "name": name,
        "kind": kind,
        "required": required,
        "options": opt(options) if options else [],
        "filter": True,
    }


SETS = {
    "realty": [
        attr("deal", "Сделка", "select", True, [("sale", "Продажа"), ("rent_long", "Долгосрочная аренда"), ("rent_daily", "Посуточная аренда")]),
        attr("rooms", "Комнаты", "select", False, [("studio", "Студия"), ("1", "1"), ("2", "2"), ("3", "3"), ("4", "4+")]),
        attr("area", "Площадь, м²", "number", False, None),
        attr("floor", "Этаж", "number", False, None),
    ],
    "land": [
        attr("deal", "Сделка", "select", True, [("sale", "Продажа"), ("rent_long", "Аренда")]),
        attr("purpose", "Назначение", "select", True, [("izhs", "ИЖС"), ("snt", "СНТ"), ("commercial", "Коммерческое")]),
        attr("area", "Площадь, сотки", "number", False, None),
    ],
    "commercial_realty": [
        attr("deal", "Сделка", "select", True, [("sale", "Продажа"), ("rent_long", "Аренда")]),
        attr("area", "Площадь, м²", "number", False, None),
        attr("purpose", "Назначение", "select", False, [("office", "Офис"), ("shop", "Магазин"), ("warehouse", "Склад"), ("industry", "Производство")]),
    ],
    "vehicle": [
        attr("condition", "Состояние", "select", True, [("new", "Новый"), ("used", "С пробегом")]),
        attr("year", "Год", "number", False, None),
        attr("mileage", "Пробег, км", "number", False, None),
        attr("brand", "Марка", "text", False, None),
    ],
    "parts": [
        attr("condition", "Состояние", "select", True, [("new", "Новая"), ("used", "Б/у")]),
        attr("brand", "Марка", "text", False, None),
    ],
    "autoservice": [
        attr("format", "Формат", "select", True, [("visit", "В сервисе"), ("onsite", "Выезд"), ("tow", "Эвакуатор")]),
    ],
    "job": [
        attr("schedule", "График", "select", False, [("full", "Полный день"), ("shift", "Сменный"), ("flex", "Гибкий"), ("temp", "Подработка")]),
        attr("experience", "Опыт", "select", False, [("none", "Без опыта"), ("1", "От 1 года"), ("3", "От 3 лет")]),
        attr("employment", "Занятость", "select", False, [("full", "Полная"), ("part", "Частичная"), ("project", "Проект")]),
        attr("workFormat", "Формат", "select", False, [("office", "На месте"), ("remote", "Удалённо"), ("hybrid", "Гибрид")]),
        attr("salary", "Зарплата, ₽", "number", False, None),
    ],
    "resume": [
        attr("experience", "Опыт", "select", False, [("none", "Без опыта"), ("1", "От 1 года"), ("3", "От 3 лет")]),
        attr("employment", "Занятость", "select", False, [("full", "Полная"), ("part", "Частичная")]),
        attr("workFormat", "Формат", "select", False, [("office", "На месте"), ("remote", "Удалённо")]),
    ],
    "service": [
        attr("format", "Формат", "select", False, [("visit", "У исполнителя"), ("onsite", "На объекте"), ("remote", "Удалённо")]),
    ],
    "goods": [
        attr("condition", "Состояние", "select", True, [("new", "Новое"), ("used", "Б/у")]),
        attr("handoff", "Получение", "select", False, [("pickup", "Самовывоз"), ("delivery", "Доставка"), ("mail", "Отправка")]),
    ],
    "equipment": [
        attr("deal", "Сделка", "select", True, [("sale", "Продажа"), ("rent", "Аренда")]),
        attr("year", "Год", "number", False, None),
    ],
    "business": [
        attr("sphere", "Отрасль", "text", False, None),
        attr("deal", "Сделка", "select", True, [("sale", "Продажа"), ("franchise", "Франшиза"), ("rent", "Аренда")]),
    ],
    "animal": [
        attr("breed", "Порода", "text", False, None),
        attr("age", "Возраст", "text", False, None),
        attr("transfer", "Передача", "select", True, [("sale", "Продажа"), ("gift", "Отдают"), ("breed", "Вязка")]),
    ],
    "free": [
        attr("transfer", "Условие", "select", True, [("gift", "Отдам даром"), ("exchange", "Обмен")]),
    ],
}


# (slug, name, set, moderation, children)
# moderation: open | licensed | review

Tree = tuple  # recursive


def leaf(slug, name, set_id="goods", moderation="open"):
    return (slug, name, set_id, moderation, [])


def branch(slug, name, children, set_id="goods", moderation="open"):
    return (slug, name, set_id, moderation, children)


ROOMS = [
    leaf("studii", "Студии", "realty", "review"),
    leaf("odnokomnatnye", "Однокомнатные", "realty", "review"),
    leaf("dvuhkomnatnye", "Двухкомнатные", "realty", "review"),
    leaf("trehkomnatnye", "Трёхкомнатные", "realty", "review"),
    leaf("komnaty", "Комнаты", "realty", "review"),
]

TREE = [
    branch("nedvizhimost", "Недвижимость", [
        branch("kvartiry", "Квартиры", [
            branch("novostroyki", "Новостройки", ROOMS, "realty", "review"),
            branch("vtorichka", "Вторичное жильё", ROOMS, "realty", "review"),
            leaf("zhilye-kompleksy", "Жилые комплексы", "realty", "review"),
        ], "realty", "review"),
        branch("doma", "Дома и дачи", [
            leaf("kottedzhi", "Коттеджи", "realty", "review"),
            leaf("dachi", "Дачи", "realty", "review"),
            leaf("taunhausy", "Таунхаусы", "realty", "review"),
            leaf("poselki", "Загородные посёлки", "realty", "review"),
        ], "realty", "review"),
        branch("uchastki", "Земельные участки", [
            leaf("izhs", "ИЖС", "land", "review"),
            leaf("snt", "СНТ", "land", "review"),
            leaf("kommercheskie-uchastki", "Коммерческие", "land", "review"),
        ], "land", "review"),
        branch("garazhi", "Гаражи и машино-места", [
            leaf("garazh", "Гаражи", "realty", "review"),
            leaf("mashinomesto", "Машино-места", "realty", "review"),
        ], "realty", "review"),
        branch("kommercheskaya", "Коммерческая недвижимость", [
            leaf("ofisy", "Офисы", "commercial_realty", "review"),
            leaf("magaziny", "Магазины", "commercial_realty", "review"),
            leaf("sklady", "Склады", "commercial_realty", "review"),
            leaf("pomeshcheniya", "Помещения", "commercial_realty", "review"),
            leaf("proizvodstvo", "Производство", "commercial_realty", "review"),
        ], "commercial_realty", "review"),
    ], "realty", "review"),
    branch("transport", "Транспорт", [
        branch("legkovye", "Легковые", [
            branch("novye", "Новые", [leaf("sedany", "Седаны", "vehicle", "review"), leaf("krossovery", "Кроссоверы", "vehicle", "review")], "vehicle", "review"),
            branch("s-probegom", "С пробегом", [leaf("sedany", "Седаны", "vehicle", "review"), leaf("krossovery", "Кроссоверы", "vehicle", "review")], "vehicle", "review"),
        ], "vehicle", "review"),
        leaf("gruzovye", "Грузовые и коммерческие", "vehicle", "review"),
        leaf("moto", "Мотоциклы, скутеры, квадроциклы", "vehicle", "review"),
        leaf("avtobusy", "Автобусы и микроавтобусы", "vehicle", "review"),
        leaf("spectehnika", "Спецтехника и сельхозтехника", "equipment", "review"),
        leaf("vodnyy", "Водный транспорт", "vehicle", "review"),
        leaf("pritsepy", "Прицепы и автодома", "vehicle", "review"),
        branch("zapchasti", "Запчасти и шины", [
            leaf("zapchasti-uzly", "Автозапчасти", "parts"),
            leaf("shiny", "Шины и диски", "parts"),
            leaf("aksessuary", "Аксессуары", "parts"),
        ], "parts"),
        branch("avtoservis", "Автосервисы", [
            leaf("diagnostika", "Диагностика", "autoservice", "licensed"),
            leaf("remont-avto", "Ремонт", "autoservice", "licensed"),
            leaf("evakuatory", "Эвакуаторы", "autoservice", "open"),
        ], "autoservice", "licensed"),
    ], "vehicle", "review"),
    branch("rabota", "Работа", [
        branch("vakansii", "Вакансии", [
            branch("stroitelstvo", "Строительство", [leaf("otdelka", "Отделка"), leaf("inzheneriya", "Инженерия")], "job", "review"),
            branch("it", "IT", [leaf("razrabotka", "Разработка"), leaf("podderzhka", "Поддержка")], "job", "review"),
            leaf("transport", "Транспорт", "job", "review"),
            leaf("proizvodstvo", "Производство", "job", "review"),
            leaf("torgovlya", "Торговля", "job", "review"),
            leaf("meditsina", "Медицина", "job", "licensed"),
            leaf("obrazovanie", "Образование", "job", "review"),
            leaf("servis", "Сервис", "job", "review"),
            leaf("bez-opyta", "Без опыта", "job", "review"),
            leaf("udalyonnaya", "Удалённая работа", "job", "review"),
            leaf("podrabotka", "Подработка", "job", "review"),
        ], "job", "review"),
        leaf("rezyume", "Резюме", "resume", "review"),
    ], "job", "review"),
    branch("uslugi", "Услуги", [
        branch("stroitelstvo-i-remont", "Строительство и ремонт", [
            branch("otoplenie", "Отопление", [leaf("radiatory", "Радиаторы", "service", "licensed")], "service", "licensed"),
            leaf("santehnika", "Сантехника", "service", "licensed"),
            leaf("elektrika", "Электрика", "service", "licensed"),
            leaf("gazifikatsiya", "Газификация", "service", "licensed"),
        ], "service", "licensed"),
        leaf("bytovaya-tehnika", "Ремонт техники, компьютеров и телефонов", "service"),
        leaf("krasota", "Красота и здоровье", "service", "licensed"),
        leaf("obuchenie", "Обучение и репетиторство", "service"),
        leaf("perevozki", "Перевозки и грузчики", "service"),
        leaf("uborka", "Уборка и клининг", "service"),
        leaf("meropriyatiya", "Организация мероприятий", "service"),
        leaf("foto-video", "Фото, видео, дизайн", "service"),
        leaf("it-uslugi", "IT, сайты, программирование", "service"),
        leaf("buhgalteriya", "Бухгалтерия и юридические услуги", "service", "licensed"),
        leaf("zhivotnye-uslugi", "Уход за животными", "service"),
        leaf("avto-uslugi", "Ремонт автомобилей", "autoservice", "licensed"),
        leaf("bytovye", "Деловые и бытовые услуги", "service"),
    ], "service"),
    branch("elektronika", "Электроника", [
        branch("smartfony", "Смартфоны и планшеты", [
            branch("android", "Android", [leaf("flagmany", "Флагманы", "goods"), leaf("byudzhet", "Бюджетные", "goods")], "goods"),
            leaf("planshety", "Планшеты", "goods"),
        ], "goods"),
        leaf("noutbuki", "Ноутбуки и компьютеры", "goods"),
        leaf("komplektuyushchie", "Комплектующие", "goods"),
        leaf("monitory", "Мониторы и периферия", "goods"),
        leaf("televizory", "Телевизоры, аудио, видео", "goods"),
        leaf("foto", "Фотоаппараты и объективы", "goods"),
        leaf("pristavki", "Игровые приставки", "goods"),
        leaf("gadzhety", "Умные часы и гаджеты", "goods"),
        leaf("bytovaya", "Бытовая техника", "goods"),
        leaf("seti", "Сетевое и серверное оборудование", "goods"),
        leaf("umnyy-dom", "Умный дом", "goods"),
    ]),
    branch("dom-i-dacha", "Для дома и дачи", [
        branch("mebel", "Мебель", [
            branch("myagkaya", "Мягкая мебель", [leaf("divany", "Диваны", "goods"), leaf("kresla", "Кресла", "goods")], "goods"),
            leaf("shkafy", "Шкафы", "goods"),
        ]),
        leaf("kuhni", "Кухни и кухонное оборудование", "goods"),
        leaf("interer", "Интерьер и декор", "goods"),
        leaf("osveshchenie", "Освещение", "goods"),
        leaf("santehnika-tovary", "Сантехника", "goods"),
        leaf("posuda", "Посуда", "goods"),
        leaf("sad", "Сад, огород, растения", "goods"),
        leaf("instrumenty", "Инструменты и хозтовары", "goods"),
    ]),
    branch("stroitelstvo", "Строительство и ремонт", [
        branch("doma", "Строительство домов", [
            branch("fundamenty", "Фундаменты", [leaf("lentochnye", "Ленточные", "service", "licensed"), leaf("svaynye", "Свайные", "service", "licensed")], "service", "licensed"),
            leaf("krovlya", "Кровля", "service", "licensed"),
            leaf("fasady", "Фасады", "service"),
        ], "service", "licensed"),
        leaf("otdelka", "Отделочные работы", "service"),
        leaf("proektirovanie", "Проектирование и архитектура", "service", "licensed"),
        leaf("inzheneriya", "Отопление, электрика, вода, септики, скважины", "service", "licensed"),
        leaf("klimat", "Вентиляция, кондиционирование, газ", "service", "licensed"),
        leaf("materialy", "Стройматериалы", "goods"),
        leaf("oborudovanie", "Строительное оборудование", "equipment"),
        leaf("landshaft", "Ландшафт и умный дом", "service"),
    ], "service", "licensed"),
    branch("odezhda", "Одежда, обувь и аксессуары", [
        branch("zhenskaya", "Женская одежда", [
            branch("verh", "Верхняя одежда", [leaf("palto", "Пальто", "goods"), leaf("kurtki", "Куртки", "goods")], "goods"),
            leaf("platya", "Платья", "goods"),
        ]),
        leaf("muzhskaya", "Мужская одежда", "goods"),
        leaf("detskaya-odezhda", "Детская одежда", "goods"),
        leaf("obuv", "Обувь", "goods"),
        leaf("sumki", "Сумки и аксессуары", "goods"),
        leaf("chasy", "Часы и украшения", "goods"),
        leaf("sport-odezhda", "Спортивная одежда", "goods"),
        leaf("svadebnaya", "Свадебная одежда", "goods"),
    ]),
    branch("deti", "Детские товары", [
        branch("kolyaski", "Коляски и автокресла", [
            branch("progulochnye", "Прогулочные", [leaf("tryohkolyosnye", "Трёхколёсные", "goods"), leaf("knizhka", "Книжка", "goods")], "goods"),
            leaf("avtokresla", "Автокресла", "goods"),
        ]),
        leaf("igrushki", "Игрушки", "goods"),
        leaf("mebel", "Мебель", "goods"),
        leaf("novorozhdennye", "Для новорождённых", "goods"),
        leaf("shkola", "Для школы", "goods"),
        leaf("transport", "Детский транспорт", "goods"),
    ]),
    branch("hobbi", "Хобби, спорт и отдых", [
        branch("velosipedy", "Велосипеды и самокаты", [
            branch("gornye", "Горные", [leaf("vzroslye", "Взрослые", "goods"), leaf("podrostkovye", "Подростковые", "goods")], "goods"),
            leaf("samokaty", "Самокаты", "goods"),
        ]),
        leaf("sport", "Спортивное оборудование", "goods"),
        leaf("turizm", "Туризм", "goods"),
        leaf("rybalka", "Рыбалка и охота", "goods", "review"),
        leaf("muzyka", "Музыкальные инструменты", "goods"),
        leaf("knigi", "Книги", "goods"),
        leaf("igry", "Игры и коллекционирование", "goods"),
        leaf("antikvariat", "Антиквариат", "goods", "review"),
        leaf("rukodelie", "Рукоделие", "goods"),
        leaf("bilety", "Билеты и мероприятия", "goods", "review"),
    ]),
    branch("zhivotnye", "Животные", [
        branch("sobaki", "Собаки", [
            branch("porody", "Породы", [leaf("srednie", "Средние", "animal", "review"), leaf("melkie", "Мелкие", "animal", "review")], "animal", "review"),
        ], "animal", "review"),
        leaf("koshki", "Кошки", "animal", "review"),
        leaf("ptitsy", "Птицы", "animal", "review"),
        leaf("ryby", "Рыбы", "animal", "review"),
        leaf("gryzuny", "Грызуны", "animal", "review"),
        leaf("selskie", "Сельскохозяйственные", "animal", "review"),
        leaf("tovary", "Товары для животных", "goods"),
        leaf("veterinar", "Ветеринария", "service", "licensed"),
        leaf("gruming", "Груминг и передержка", "service"),
    ], "animal", "review"),
    branch("biznes", "Для бизнеса", [
        branch("gotovyy", "Готовый бизнес", [
            branch("obshchepit", "Общепит", [leaf("kafe", "Кафе", "business", "review"), leaf("pekarni", "Пекарни", "business", "review")], "business", "review"),
        ], "business", "review"),
        leaf("franshizy", "Франшизы", "business", "review"),
        leaf("proizvodstvo", "Производственное оборудование", "equipment"),
        leaf("torgovoe", "Торговое оборудование", "equipment"),
        leaf("ofis", "Офисная техника и мебель", "goods"),
        leaf("sklad", "Складская техника", "equipment"),
        leaf("transport", "Коммерческий транспорт", "vehicle", "review"),
        leaf("syryo", "Сырьё и опт", "goods", "review"),
        leaf("arenda", "Аренда оборудования", "equipment"),
        leaf("b2b", "B2B-услуги", "service"),
    ], "business", "review"),
    branch("krasota", "Красота и здоровье", [
        branch("kosmetika", "Косметика", [
            branch("uhod", "Уход", [leaf("litso", "Лицо", "goods"), leaf("telo", "Тело", "goods")], "goods"),
        ]),
        leaf("parfyumeriya", "Парфюмерия", "goods"),
        leaf("oborudovanie", "Оборудование для салонов", "equipment"),
        leaf("fitnes", "Фитнес-товары", "goods"),
        leaf("tovary-zdorovya", "Товары для здоровья", "goods", "licensed"),
        leaf("specialisty", "Услуги специалистов", "service", "licensed"),
    ]),
    branch("podarki", "Подарки и ручная работа", [
        branch("ruchnaya", "Авторские изделия", [
            branch("ukrasheniya", "Украшения", [leaf("sergi", "Серьги", "goods"), leaf("braslety", "Браслеты", "goods")], "goods"),
        ]),
        leaf("suveniry", "Сувениры и наборы", "goods"),
        leaf("dekor", "Декоративные изделия", "goods"),
        leaf("prazdniki", "Товары для праздников", "goods"),
    ]),
    branch("darom", "Отдам даром и обмен", [
        branch("veshchi", "Бесплатные вещи", [
            branch("mebel", "Мебель", [leaf("shkafy", "Шкафы", "free"), leaf("stoly", "Столы", "free")], "free"),
        ], "free"),
        leaf("obmen", "Обмен товарами", "free"),
        leaf("peredacha", "Безвозмездная передача", "free"),
    ], "free"),
]

ICONS = {
    "nedvizhimost": "Building2",
    "transport": "Car",
    "rabota": "Briefcase",
    "uslugi": "Wrench",
    "elektronika": "Smartphone",
    "dom-i-dacha": "Sofa",
    "stroitelstvo": "HardHat",
    "odezhda": "Shirt",
    "deti": "Baby",
    "hobbi": "Bike",
    "zhivotnye": "PawPrint",
    "biznes": "Store",
    "krasota": "Sparkles",
    "podarki": "Gift",
    "darom": "HeartHandshake",
}

RULES = {
    "open": ["Объявление проходит модерацию перед публикацией.", "Цена не подставляется автоматически."],
    "review": ["Раздел с дополнительной проверкой сведений.", "Контакты и адрес не публикуются до модерации."],
    "licensed": ["Публикация только при подтверждении допуска или лицензии, если она требуется законом.", "Самостоятельные работы с газом, электричеством и медициной в текст не включаются."],
}

SORTS = {
    "realty": ["title", "area"],
    "land": ["title", "area"],
    "commercial_realty": ["title", "area"],
    "vehicle": ["title", "year"],
    "job": ["title"],
    "default": ["title"],
}


def main() -> None:
    nodes = []
    order = 0

    def walk(items, parent_id, parent_path, root_slug, depth):
        nonlocal order
        for slug, name, set_id, moderation, children in items:
            path = f"{parent_path}/{slug}" if parent_path else slug
            node_id = "tax-" + path.replace("/", "-")
            root = root_slug or slug
            order += 1
            nodes.append(
                {
                    "id": node_id,
                    "slug": slug,
                    "parentId": parent_id,
                    "name": name,
                    "description": REFERENCE,
                    "listingKind": kind_of(set_id),
                    "attributeSet": set_id,
                    "moderation": moderation,
                    "rules": RULES[moderation],
                    "seoTitle": name,
                    "seoDescription": f"{name}. {REFERENCE}",
                    "icon": ICONS.get(root, "LayoutGrid"),
                    "order": order,
                    "path": path,
                    "depth": depth,
                    "sorts": SORTS.get(set_id, SORTS["default"]),
                }
            )
            walk(children, node_id, path, root, depth + 1)

    walk(TREE, None, "", None, 1)
    depths = {item["depth"] for item in nodes}
    if 4 not in depths:
        raise SystemExit(f"expected depth 4, got {sorted(depths)}")
    slugs_by_parent = {}
    for item in nodes:
        slugs_by_parent.setdefault(item["parentId"], []).append(item["slug"])
    for parent, slugs in slugs_by_parent.items():
        if len(slugs) != len(set(slugs)):
            raise SystemExit(f"duplicate slug under {parent}")

    payload = {
        "policy": {
            "banned": [
                "Оружие и боеприпасы",
                "Наркотики и прекурсоры",
                "Табак, алкоголь и никотинсодержащие товары",
                "Рецептурные лекарства и медицинские изделия с ограничениями",
                "Материалы для взрослых",
                "Животные и растения, оборот которых запрещён",
                "Поддельные документы, аккаунты и персональные данные",
            ],
            "note": "Эти направления не заведены в каталог. Публикация без отдельной юридической проверки запрещена.",
        },
        "attributeSets": SETS,
        "nodes": nodes,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    demos = [
        demo("realty-flat", "realty", "nedvizhimost/kvartiry/vtorichka/dvuhkomnatnye", "Образец карточки: двухкомнатная квартира", "house-brick", "Цена не указана", {"deal": "sale", "rooms": "2", "area": "54", "floor": "5"}, ["54 м²", "2 комнаты", "5 этаж"]),
        demo("vehicle-car", "vehicle", "transport/legkovye/s-probegom/sedany", "Образец карточки: легковой автомобиль", None, "Цена не указана", {"condition": "used", "year": "2018", "mileage": "84000", "brand": "не указана"}, ["седан", "2018", "84 000 км"]),
        demo("job-it", "job", "rabota/vakansii/it/razrabotka", "Образец карточки: вакансия", None, "Зарплата не указана", {"schedule": "full", "experience": "1", "employment": "full", "workFormat": "remote"}, ["удалённо", "полный день", "опыт от 1 года"]),
        demo("resume-person", "resume", "rabota/rezyume", "Образец карточки: резюме", None, "Зарплата не указана", {"experience": "3", "employment": "full", "workFormat": "office"}, ["опыт от 3 лет", "на месте"]),
        demo("service-heat", "service", "uslugi/stroitelstvo-i-remont/otoplenie/radiatory", "Образец карточки: услуга", "heat-radiator", "Цена не указана", {"format": "onsite"}, ["на объекте"]),
        demo("goods-phone", "goods", "elektronika/smartfony/android/flagmany", "Образец карточки: товар", None, "Цена не указана", {"condition": "used", "handoff": "pickup"}, ["б/у", "самовывоз"]),
        demo("equipment-crane", "equipment", "stroitelstvo/oborudovanie", "Образец карточки: оборудование", "construction", "Цена не указана", {"deal": "rent", "year": "2020"}, ["аренда", "2020"]),
        demo("business-cafe", "business", "biznes/gotovyy/obshchepit/kafe", "Образец карточки: готовый бизнес", None, "Цена не указана", {"deal": "sale", "sphere": "общепит"}, ["продажа", "общепит"]),
        demo("animal-dog", "animal", "zhivotnye/sobaki/porody/srednie", "Образец карточки: животное", None, "Цена не указана", {"breed": "не указана", "age": "не указан", "transfer": "gift"}, ["передают", "порода не указана"]),
        demo("free-wardrobe", "free", "darom/veshchi/mebel/shkafy", "Образец карточки: отдам даром", None, "Без цены", {"transfer": "gift"}, ["даром"]),
    ]
    DEMOS.write_text(json.dumps(demos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("nodes", len(nodes), "max depth", max(depths), "demos", len(demos))


def kind_of(set_id: str) -> str:
    return {
        "realty": "realty",
        "land": "realty",
        "commercial_realty": "realty",
        "vehicle": "vehicle",
        "parts": "goods",
        "autoservice": "service",
        "job": "job",
        "resume": "resume",
        "service": "service",
        "goods": "goods",
        "equipment": "equipment",
        "business": "business",
        "animal": "animal",
        "free": "free",
    }[set_id]


def demo(slug, kind, path, title, image, price_label, attributes, facts):
    return {
        "id": f"demo-{slug}",
        "slug": slug,
        "kind": kind,
        "categoryPath": path,
        "title": title,
        "facts": facts,
        "regionId": "moskovskaya-oblast",
        "imageId": image,
        "price": None,
        "priceLabel": price_label,
        "attributes": attributes,
        "originNote": "Образец интерфейса. Это не объявление, не продавец и не цена.",
    }


if __name__ == "__main__":
    main()
