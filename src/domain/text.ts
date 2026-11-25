export function normalize(value: string) {
  return value.toLocaleLowerCase("ru").replaceAll("ё", "е").replaceAll("й", "и").trim();
}
