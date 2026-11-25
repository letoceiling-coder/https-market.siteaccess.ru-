"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DemoBanner } from "@/components/classified/demo-banner";
import { DemoCard } from "@/components/classified/demo-card";
import { ListingGrid } from "@/components/site/cards";
import { EmptyState } from "@/components/site/states";
import type { ClassifiedDemo } from "@/domain/classified";
import { useRegion } from "@/hooks/region";
import { matchesRegion, regionLabel } from "@/services/region";

export function RegionFeed({
  items,
  title = "Рекомендации для вас",
  columns = "feed",
}: {
  items: ClassifiedDemo[];
  title?: string;
  columns?: "feed" | "catalog";
}) {
  const region = useRegion();
  const visible = matchesRegion(items, region.id);

  return (
    <section className="mt-5" aria-label={title}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-[20px] leading-6 font-bold sm:text-[22px] sm:leading-7">{title}</h2>
        {items.length > 0 ? <DemoBanner /> : null}
      </div>
      {visible.length > 0 ? (
        <ListingGrid columns={columns}>
          {visible.map((item) => (
            <DemoCard key={item.id} item={item} />
          ))}
        </ListingGrid>
      ) : (
        <EmptyState
          title={region.id ? `В регионе «${regionLabel(region.id)}» объявлений нет` : "Объявлений пока нет"}
          text={
            region.id
              ? "Не показываем объявления из других городов. Смените регион или посмотрите всю Россию."
              : "Здесь появятся объявления после публикации. Вы можете стать первым."
          }
          action={
            region.id ? (
              <button type="button" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white" onClick={() => region.setRegion("")}>
                Смотреть всю Россию
              </button>
            ) : (
              <Link href="/account/partner/listings/new" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white">
                Подать объявление
              </Link>
            )
          }
        />
      )}
    </section>
  );
}

export function RegionAwareList({
  items,
  children,
}: {
  items: ClassifiedDemo[];
  children: (visible: ClassifiedDemo[]) => ReactNode;
}) {
  const region = useRegion();
  return <>{children(matchesRegion(items, region.id))}</>;
}
