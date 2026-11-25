import articlesJson from "@/data/articles.json";
import advertisingJson from "@/data/advertising.json";
import calculatorsJson from "@/data/calculators.json";
import categoriesJson from "@/data/categories.json";
import companiesJson from "@/data/companies.json";
import constructionJson from "@/data/construction.json";
import glossaryJson from "@/data/glossary.json";
import mediaJson from "@/data/media.json";
import propertiesJson from "@/data/properties.json";
import regionsJson from "@/data/regions.json";
import scenariosJson from "@/data/scenarios.json";
import servicesJson from "@/data/services.json";
import { normalize } from "@/domain/text";
import { taxonomyDocuments } from "@/services/classified";
import type {
  AdvertisementPlacement,
  Article,
  CalculatorLink,
  Category,
  Company,
  ConstructionPackage,
  ConstructionTechnology,
  GlossaryEntry,
  MediaAsset,
  Property,
  PropertyKind,
  Region,
  SearchDocument,
  Service,
} from "@/domain/types";

const categories = categoriesJson as Category[];
const services = servicesJson as Service[];
const articles = articlesJson as Article[];
const properties = propertiesJson as Property[];
const regions = regionsJson as Region[];
const companies = companiesJson as Company[];
const media = mediaJson as MediaAsset[];
const glossary = glossaryJson as GlossaryEntry[];
const advertising = advertisingJson as AdvertisementPlacement[];
const calculators = calculatorsJson as CalculatorLink[];
const scenarios = scenariosJson as { title: string; text: string; href: string }[];
const construction = constructionJson as {
  technologies: ConstructionTechnology[];
  packages: ConstructionPackage[];
};

const mediaById = new Map(media.map((item) => [item.id, item]));

export function getMedia(id: string) {
  const asset = mediaById.get(id);
  if (!asset) throw new Error(`Нет медиафайла ${id}`);
  return asset;
}

export function getCategories() {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function getCategory(slug: string) {
  return categories.find((item) => item.slug === slug) ?? null;
}

export function getServices(categoryId?: string) {
  const list = categoryId ? services.filter((item) => item.categoryId === categoryId) : services;
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function getService(categorySlug: string, serviceSlug: string) {
  const category = getCategory(categorySlug);
  if (!category) return null;
  return services.find((item) => item.categoryId === category.id && item.slug === serviceSlug) ?? null;
}

export function getServiceById(id: string) {
  return services.find((item) => item.id === id) ?? null;
}

export function getRelatedServices(service: Service) {
  return service.relatedIds.map(getServiceById).filter((item): item is Service => Boolean(item));
}

export function getArticles() {
  return articles;
}

export function getArticle(slug: string) {
  return articles.find((item) => item.slug === slug) ?? null;
}

export function getProperties() {
  return properties;
}

export function getProperty(slug: string) {
  return properties.find((item) => item.slug === slug) ?? null;
}

export function getRegions() {
  return regions;
}

export function getRegion(id: string) {
  return regions.find((item) => item.id === id) ?? null;
}

export function getCompanies() {
  return companies;
}

export function getCompany(slug: string) {
  return companies.find((item) => item.slug === slug) ?? null;
}

export function getGlossary() {
  return [...glossary].sort((a, b) => a.term.localeCompare(b.term, "ru"));
}

export function getAdvertising() {
  return advertising;
}

export function getPlacement(slug: string) {
  return advertising.find((item) => item.slug === slug) ?? advertising[0];
}

export function getCalculators() {
  return calculators;
}

export function getCalculator(slug: string) {
  return calculators.find((item) => item.slug === slug) ?? null;
}

export function getScenarios() {
  return scenarios;
}

export function getConstruction() {
  return construction;
}

export type PropertyFilters = {
  kind: "all" | PropertyKind;
  region: string;
  areaMin: number | null;
  areaMax: number | null;
  purpose: string;
  readiness: string;
  wall: string;
  water: boolean;
  heating: boolean;
  gas: boolean;
  electricity: boolean;
  sewage: boolean;
  priceMin: number | null;
  priceMax: number | null;
  sort: "area_asc" | "area_desc" | "title";
  view: "grid" | "list";
  page: number;
  state: "" | "empty" | "error";
};

export function parsePropertyFilters(source: Record<string, string | string[] | undefined>): PropertyFilters {
  const read = (key: string) => {
    const value = source[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  const kind = read("kind");
  const sort = read("sort");
  const view = read("view");
  const state = read("state");
  return {
    kind: kind === "house" || kind === "cottage" || kind === "land" ? kind : "all",
    region: read("region"),
    areaMin: numberOrNull(read("areaMin")),
    areaMax: numberOrNull(read("areaMax")),
    purpose: read("purpose"),
    readiness: read("readiness"),
    wall: read("wall"),
    water: read("water") === "1",
    heating: read("heating") === "1",
    gas: read("gas") === "1",
    electricity: read("electricity") === "1",
    sewage: read("sewage") === "1",
    priceMin: numberOrNull(read("priceMin")),
    priceMax: numberOrNull(read("priceMax")),
    sort: sort === "area_asc" || sort === "area_desc" || sort === "title" ? sort : "title",
    view: view === "list" ? "list" : "grid",
    page: Math.max(1, Number(read("page")) || 1),
    state: state === "empty" || state === "error" ? state : "",
  };
}

export function propertyArea(item: Property) {
  return item.kind === "land" ? item.landArea : item.houseArea;
}

export function filterProperties(filters: PropertyFilters) {
  if (filters.state === "empty") return [];
  const priceActive = filters.priceMin !== null || filters.priceMax !== null;
  return properties
    .filter((item) => {
      if (priceActive) return false;
      if (filters.kind !== "all" && item.kind !== filters.kind) return false;
      if (filters.region && item.regionId !== filters.region) return false;
      if (filters.purpose && item.purpose !== filters.purpose) return false;
      if (filters.readiness && item.readiness !== filters.readiness) return false;
      if (filters.wall && item.wallMaterial !== filters.wall) return false;
      const area = propertyArea(item);
      if (filters.areaMin !== null && (area === null || area < filters.areaMin)) return false;
      if (filters.areaMax !== null && (area === null || area > filters.areaMax)) return false;
      if (filters.water && item.communications.water !== true) return false;
      if (filters.heating && item.communications.heating !== true) return false;
      if (filters.gas && item.communications.gas !== true) return false;
      if (filters.electricity && item.communications.electricity !== true) return false;
      if (filters.sewage && item.communications.sewage !== true) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "title") return a.title.localeCompare(b.title, "ru");
      const left = propertyArea(a) ?? 0;
      const right = propertyArea(b) ?? 0;
      return filters.sort === "area_asc" ? left - right : right - left;
    });
}

export function paginate<T>(items: T[], page: number, perPage = 6) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), total, pages, current, perPage };
}

export function similarProperties(item: Property) {
  return properties.filter((other) => other.id !== item.id && (other.kind === item.kind || other.regionId === item.regionId)).slice(0, 3);
}

export function searchCatalog(query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  return getSearchIndex()
    .map((item) => ({ item, score: scoreText(normalize(`${item.title} ${item.text}`), tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map((item) => item.item);
}

export function getSearchIndex(): SearchDocument[] {
  const docs: SearchDocument[] = [
    ...taxonomyDocuments(),
    ...getCategories().map((item) => ({
      id: item.id,
      type: "category" as const,
      title: item.name,
      href: `/services/${item.slug}`,
      text: `${item.summary} ${item.description}`,
    })),
    ...services.map((item) => ({
      id: item.id,
      type: "service" as const,
      title: item.name,
      href: `/services/${item.categoryId}/${item.slug}`,
      text: `${item.summary} ${item.description}`,
    })),
    ...articles.map((item) => ({
      id: item.id,
      type: "article" as const,
      title: item.title,
      href: `/articles/${item.slug}`,
      text: item.summary,
    })),
    ...properties.map((item) => ({
      id: item.id,
      type: "property" as const,
      title: item.title,
      href: `/properties/${item.slug}`,
      text: item.summary,
    })),
    ...calculators.map((item) => ({
      id: item.slug,
      type: "calculator" as const,
      title: item.name,
      href: `/calculators/${item.slug}`,
      text: item.summary,
    })),
    { id: "construction", type: "page", title: "Строительство", href: "/construction", text: "технологии домов фундамент кровля" },
    { id: "partners", type: "page", title: "Партнёры", href: "/partners", text: "компании кабинет объявления" },
    { id: "contacts", type: "page", title: "Контакты", href: "/contacts", text: "связь заявка" },
  ];
  return docs;
}

export function propertyFacets() {
  return {
    purposes: unique(properties.map((item) => item.purpose)),
    readiness: unique(properties.map((item) => item.readiness)),
    walls: unique(properties.map((item) => item.wallMaterial).filter((item): item is string => Boolean(item))),
  };
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scoreText(haystack: string, tokens: string[]) {
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length > 4 ? 5 : 3;
      continue;
    }
    if (token.length >= 4 && haystack.split(/\s+/).some((word) => editDistance(word, token) <= 1)) {
      score += 2;
      continue;
    }
    return 0;
  }
  return score;
}

function editDistance(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return 2;
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[left.length][right.length];
}
