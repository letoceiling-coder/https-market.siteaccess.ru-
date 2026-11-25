import { readFileSync } from "node:fs";
import { estimateCooling, estimateHeating, estimateSeptic, configureHouse } from "../src/domain/calculators.ts";

const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), "utf8"));
const services = read("services.json");
const categories = read("categories.json");
const properties = read("properties.json");
const companies = read("companies.json");
const articles = read("articles.json");
const media = read("media.json");
const ids = new Set(services.map((item) => item.id));
const mediaIds = new Set(media.map((item) => item.id));
const slugs = new Set();
const failures = [];

if (services.length !== 80) failures.push(`services ${services.length}`);
if (categories.length !== 12) failures.push(`categories ${categories.length}`);
for (const service of services) {
  if (slugs.has(service.slug)) failures.push(`duplicate ${service.slug}`);
  slugs.add(service.slug);
  if (service.pricePolicy !== "on_request") failures.push(`price ${service.id}`);
  for (const related of service.relatedIds) {
    if (!ids.has(related)) failures.push(`related ${service.id} ${related}`);
  }
  if (!mediaIds.has(service.imageId)) failures.push(`media ${service.imageId}`);
}
for (const property of properties) {
  if (property.price !== null) failures.push(`property price ${property.id}`);
  if (property.status !== "demo") failures.push(`property status ${property.id}`);
  if (property.locationPrecision !== "region_only") failures.push(`address ${property.id}`);
}
for (const company of companies) {
  if (company.contactsPublished !== false) failures.push(`contacts ${company.id}`);
}
const text = JSON.stringify({ services, properties, companies, articles });
if (/отзыв/i.test(text) && /★|рейтинг \d/.test(text)) failures.push("review-like copy");

const heat = estimateHeating({ area: 100, insulation: "medium", climate: "center", indoorC: 20, outdoorC: -25 });
if (heat.kilowatts !== 7) failures.push(`heat ${heat.kilowatts}`);
const septic = estimateSeptic({ people: 4, litersPerPerson: 150, seasonal: false, highGroundwater: true, soil: "clay" });
if (septic.holdingM3 !== 1.8) failures.push(`septic ${septic.holdingM3}`);
const cool = estimateCooling({ area: 20, height: 2.7, glazing: "north", topFloor: false, kitchen: false });
if (cool.kilowatts !== 2) failures.push(`cool ${cool.kilowatts}`);
const house = configureHouse({ area: 120, floors: 2, wall: "aerated", foundation: "slab", finish: "rough", systems: [] });
if (house.lines[0].value !== "120 м²") failures.push("house");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`ok services=${services.length} properties=${properties.length} articles=${articles.length}`);
