import { ListingCard } from "@/components/classified/listing-card";
import type { ClassifiedDemo } from "@/domain/classified";
import { demoCardData } from "@/services/card-data";

/** DEMO listing card. The DEMO badge is part of the data contract, not decoration. */
export function DemoCard({ item }: { item: ClassifiedDemo }) {
  return <ListingCard item={demoCardData(item)} />;
}
