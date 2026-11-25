"use client";

import Link from "next/link";
import { PropertyTile, type PropertyView } from "@/components/site/property-tile";
import { EmptyState } from "@/components/site/states";
import { useRegion } from "@/hooks/region";

export function HomeProperties({ items }: { items: PropertyView[] }) {
  const region = useRegion();
  const matched = items.filter((item) => !region.id || item.regionId === region.id).slice(0, 5);
  if (matched.length === 0) {
    return (
      <EmptyState
        title="В этом регионе образцов нет"
        text="Карточки демонстрационные и привязаны только к части справочника регионов."
        action={<Link href="/properties" className="text-sm text-primary">Смотреть все</Link>}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {matched.map((item) => (
        <PropertyTile key={item.id} item={item} />
      ))}
    </div>
  );
}
