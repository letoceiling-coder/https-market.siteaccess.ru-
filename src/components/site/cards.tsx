import type { ReactNode } from "react";
import { ListingCard } from "@/components/classified/listing-card";
import type { Property, Service } from "@/domain/types";
import { propertyCardData, serviceCardData } from "@/services/card-data";

/** Marketplace grid: 2 columns on phones, 5 on desktop, identical gaps everywhere. */
export function ListingGrid({ children, columns = "feed" }: { children: ReactNode; columns?: "feed" | "catalog" }) {
  const className = columns === "feed"
    ? "grid grid-cols-2 gap-x-2.5 gap-y-5 sm:gap-x-4 sm:gap-y-7 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    : "grid grid-cols-2 gap-x-2.5 gap-y-5 sm:gap-x-4 sm:gap-y-7 md:grid-cols-3 xl:grid-cols-4";
  return <div className={className}>{children}</div>;
}

export function ServiceCard({ service }: { service: Service }) {
  return <ListingCard item={serviceCardData(service)} />;
}

export function PropertyCard({ property, view = "grid" }: { property: Property; view?: "grid" | "list" }) {
  return <ListingCard item={propertyCardData(property, view === "list")} />;
}
