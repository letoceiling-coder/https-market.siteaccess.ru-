import type { MediaAsset } from "@/domain/types";

/** View model of one listing card. Every list in the product (feed, catalog, search, favorites) renders this shape. */
export interface ListingCardData {
  id: string;
  href: string;
  title: string;
  price: string;
  facts?: string;
  place?: string;
  date?: string;
  media: MediaAsset | null;
  badge?: string;
  /** Mobile list mode (photo left, text right) for jobs and services. */
  listOnMobile?: boolean;
  /** Horizontal row on every breakpoint (list view). */
  row?: boolean;
}
