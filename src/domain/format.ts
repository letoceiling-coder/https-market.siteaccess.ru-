import type { ClassifiedDemo } from "@/domain/classified";

const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function formatRub(value: number) {
  return `${Math.round(value).toLocaleString("ru-RU").replace(/\u00a0/g, " ")} ₽`;
}

/** Price line of a card: "9 400 000 ₽", "от 3 500 ₽", "55 000 ₽ в месяц" or the label when there is no price. */
export function formatListingPrice(item: Pick<ClassifiedDemo, "price" | "priceSuffix" | "priceLabel">) {
  if (item.price === null) return item.priceLabel;
  if (item.priceSuffix === "от") return `от ${formatRub(item.price)}`;
  return item.priceSuffix ? `${formatRub(item.price)} ${item.priceSuffix}` : formatRub(item.price);
}

/** Fixed ISO date in, short Russian date out. No clock access, so the page stays static. */
export function formatPostedAt(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${months[month - 1]}`;
}
