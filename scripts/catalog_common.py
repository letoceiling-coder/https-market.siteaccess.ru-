NOW = "2026-11-01T09:00:00.000Z"

REFERENCE = {
    "kind": "reference",
    "note": "Справочное описание. Это не коммерческое предложение, не прайс и не подтверждённый объект HELP HOMES.",
}

DEMO = {
    "kind": "interface_demo",
    "note": "Демонстрация интерфейса. Запись не является объявлением, компанией или объектом продажи.",
}

DRAFT = {
    "kind": "editorial_draft",
    "note": "Черновик базы знаний. Перед публикацией как рекомендация нужна проверка профильным специалистом.",
}


def stamps():
    return {"createdAt": NOW, "updatedAt": NOW}


def service(
    category,
    slug,
    name,
    summary,
    description,
    suitable,
    includes,
    requirements,
    stages,
    equipment,
    limitations,
    technology,
    faq,
    image,
    related,
    safety,
    checks,
):
    return {
        "id": f"svc-{slug}",
        "slug": slug,
        "categoryId": category,
        "name": name,
        "summary": summary,
        "description": description,
        "suitableFor": suitable,
        "includes": includes,
        "requirements": requirements,
        "stages": [{"title": title, "text": text} for title, text in stages],
        "equipment": [{"name": title, "note": text} for title, text in equipment],
        "timelineNote": "Срок определяют проект, доступ на объект и поставка оборудования. На сайте нет утверждённых сроков.",
        "checks": checks,
        "safety": safety,
        "limitations": limitations,
        "technology": technology,
        "faq": [{"question": q, "answer": a} for q, a in faq],
        "relatedIds": [f"svc-{item}" for item in related],
        "imageId": image,
        "status": "published",
        "editorialStatus": "pending_specialist_review",
        "origin": REFERENCE,
        "pricePolicy": "on_request",
        **stamps(),
    }
