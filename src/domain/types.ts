export type IsoDateTime = string;

export type PublicationStatus = "draft" | "review" | "published" | "rejected" | "archived";

export type EditorialStatus = "reference" | "pending_specialist_review" | "approved";

export type DataOrigin =
  | { kind: "reference"; note: string }
  | { kind: "interface_demo"; note: string }
  | { kind: "editorial_draft"; note: string };

export interface Timestamps {
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface MediaAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  license: string;
  licenseUrl: string;
  author: string;
  authorUrl: string;
  sourceUrl: string;
}

export interface Region extends Timestamps {
  id: string;
  slug: string;
  name: string;
  kind: "city" | "region";
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Stage {
  title: string;
  text: string;
}

export interface EquipmentNote {
  name: string;
  note: string;
}

export interface Category extends Timestamps {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  audience: string[];
  technology: string;
  advantages: string[];
  limitations: string[];
  imageId: string;
  order: number;
  status: PublicationStatus;
  editorialStatus: EditorialStatus;
  origin: DataOrigin;
}

export interface Service extends Timestamps {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  summary: string;
  description: string;
  suitableFor: string[];
  includes: string[];
  requirements: string[];
  stages: Stage[];
  equipment: EquipmentNote[];
  timelineNote: string;
  checks: string[];
  safety: string[];
  limitations: string[];
  technology: string;
  faq: FaqItem[];
  relatedIds: string[];
  imageId: string;
  status: PublicationStatus;
  editorialStatus: EditorialStatus;
  origin: DataOrigin;
  pricePolicy: "on_request";
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article extends Timestamps {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sections: ArticleSection[];
  relatedServiceIds: string[];
  imageId: string;
  status: PublicationStatus;
  editorialStatus: EditorialStatus;
  origin: DataOrigin;
  reviewedAt: null;
}

export interface GlossaryEntry {
  id: string;
  slug: string;
  term: string;
  definition: string;
  relatedServiceIds: string[];
}

export interface PropertyCommunications {
  water: boolean | null;
  heating: boolean | null;
  gas: boolean | null;
  electricity: boolean | null;
  sewage: boolean | null;
  access: string;
}

export type PropertyKind = "house" | "cottage" | "land";

export interface Property extends Timestamps {
  id: string;
  slug: string;
  kind: PropertyKind;
  title: string;
  summary: string;
  regionId: string;
  locationPrecision: "region_only";
  houseArea: number | null;
  landArea: number | null;
  floors: number | null;
  purpose: string;
  readiness: string;
  wallMaterial: string | null;
  communications: PropertyCommunications;
  documentsNote: string;
  imageIds: string[];
  status: "demo";
  origin: DataOrigin;
  price: null;
}

export interface Company extends Timestamps {
  id: string;
  slug: string;
  name: string;
  summary: string;
  regions: string[];
  directions: string[];
  contactsPublished: false;
  portfolioPublished: false;
  status: "demo";
  origin: DataOrigin;
  imageId: string;
}

export interface ConstructionTechnology {
  id: string;
  slug: string;
  name: string;
  summary: string;
  suitableFor: string;
  watchouts: string[];
  serviceId: string;
}

export interface ConstructionPackage {
  id: string;
  name: string;
  summary: string;
  includes: string[];
  excludes: string[];
}

export interface AdvertisementPlacement {
  id: string;
  slug: string;
  name: string;
  summary: string;
  where: string;
  format: string;
  rules: string[];
  price: null;
}

export interface SearchDocument {
  id: string;
  type: "category" | "service" | "article" | "property" | "calculator" | "page" | "listing";
  title: string;
  href: string;
  text: string;
}

export interface CalculatorLink {
  slug: string;
  name: string;
  summary: string;
  disclaimer: string;
}
