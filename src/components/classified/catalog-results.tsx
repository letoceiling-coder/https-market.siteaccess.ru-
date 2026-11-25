"use client";

import Link from "next/link";
import { DemoCard } from "@/components/classified/demo-card";
import { ListingGrid } from "@/components/site/cards";
import { EmptyState } from "@/components/site/states";
import type { ClassifiedDemo } from "@/domain/classified";
import { useRegion } from "@/hooks/region";
import { matchesRegion } from "@/services/region";

export function CatalogResults({
  items,
  hasDemos,
  blocked,
  resetHref,
}: {
  items: ClassifiedDemo[];
  hasDemos: boolean;
  blocked: boolean;
  resetHref: string;
}) {
  const region = useRegion();
  const visible = matchesRegion(items, region.id);
  if (blocked) return null;
  if (visible.length === 0) {
    return (
      <EmptyState
        title={hasDemos ? "Ничего не найдено" : "В этом разделе пока нет объявлений"}
        text={hasDemos ? "Измените фильтры или регион." : "Живые объявления появятся здесь после публикации. Вы можете подать своё."}
        action={
          <Link href={hasDemos ? resetHref : "/account/partner/listings/new"} className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">
            {hasDemos ? "Сбросить фильтры" : "Подать объявление"}
          </Link>
        }
      />
    );
  }
  return (
    <ListingGrid columns="catalog">
      {visible.map((item) => (
        <DemoCard key={item.id} item={item} />
      ))}
    </ListingGrid>
  );
}
