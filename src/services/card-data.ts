import type { ClassifiedDemo } from "@/domain/classified";
import type { ListingCardData } from "@/domain/card";
import { formatListingPrice, formatPostedAt } from "@/domain/format";
import type { Property, Service } from "@/domain/types";
import { getCategory, getMedia, getRegion, propertyArea } from "@/services/catalog";

const LIST_KINDS = new Set(["job", "resume", "service"]);

export function demoCardData(item: ClassifiedDemo): ListingCardData {
  return {
    id: item.id,
    href: `/samples/${item.slug}`,
    title: item.title,
    price: formatListingPrice(item),
    facts: item.facts.join(" · "),
    place: item.place || getRegion(item.regionId)?.name,
    date: formatPostedAt(item.postedAt),
    media: getMedia(item.imageId),
    badge: "DEMO",
    listOnMobile: LIST_KINDS.has(item.kind),
  };
}

export function serviceCardData(service: Service): ListingCardData {
  return {
    id: service.id,
    href: `/services/${service.categoryId}/${service.slug}`,
    title: service.name,
    price: "Цена по запросу",
    facts: getCategory(service.categoryId)?.name ?? "Услуга",
    media: getMedia(service.imageId),
    listOnMobile: true,
  };
}

export function propertyCardData(property: Property, row = false): ListingCardData {
  const area = propertyArea(property);
  const facts = [
    area ? `${area} ${property.kind === "land" ? "сот." : "м²"}` : null,
    property.purpose,
    property.wallMaterial,
  ].filter(Boolean).join(" · ");
  return {
    id: property.id,
    href: `/properties/${property.slug}`,
    title: property.title,
    price: "Цена не указана",
    facts: facts || "Характеристики образца",
    place: getRegion(property.regionId)?.name ?? "Регион не указан",
    media: getMedia(property.imageIds[0]),
    row,
  };
}
