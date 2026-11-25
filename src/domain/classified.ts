export type ListingKind =
  | "realty"
  | "vehicle"
  | "job"
  | "resume"
  | "service"
  | "goods"
  | "equipment"
  | "business"
  | "animal"
  | "free";

export type ModerationMode = "open" | "licensed" | "review";

export interface AttributeOption {
  id: string;
  name: string;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  kind: "select" | "number" | "text";
  required: boolean;
  options: AttributeOption[];
  filter: boolean;
}

export interface TaxonNode {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  description: string;
  listingKind: ListingKind;
  attributeSet: string;
  moderation: ModerationMode;
  rules: string[];
  seoTitle: string;
  seoDescription: string;
  icon: string;
  order: number;
  path: string;
  depth: number;
  sorts: string[];
}

export interface TaxonomyFile {
  policy: { banned: string[]; note: string };
  attributeSets: Record<string, CategoryAttribute[]>;
  nodes: TaxonNode[];
}

/**
 * Test card for UI checks only. Every record carries demo: true and is served
 * exclusively when UI_DEMO_MODE is on. It is not an advertisement, a seller or a real price.
 */
export interface ClassifiedDemo {
  id: string;
  slug: string;
  demo: true;
  kind: ListingKind;
  categoryPath: string;
  title: string;
  facts: string[];
  params: [string, string][];
  description: string;
  regionId: string;
  place: string;
  postedAt: string;
  imageId: string;
  gallery: string[];
  /** Optional short clip shown first in the gallery. */
  video?: { src: string; poster: string } | null;
  price: number | null;
  priceSuffix?: string;
  priceLabel: string;
  attributes: Record<string, string>;
  originNote: string;
}

export const KIND_LABEL: Record<ListingKind, string> = {
  realty: "Недвижимость",
  vehicle: "Транспорт",
  job: "Вакансия",
  resume: "Резюме",
  service: "Услуга",
  goods: "Товар",
  equipment: "Техника",
  business: "Бизнес",
  animal: "Животное",
  free: "Без цены",
};
