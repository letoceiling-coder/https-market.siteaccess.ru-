"use client";

import Link from "next/link";
import { ListingCard } from "@/components/classified/listing-card";
import { EmptyState } from "@/components/site/states";
import type { ListingCardData } from "@/domain/card";
import { useStoredIds } from "@/hooks/storage";

const grid = "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export function FavoritesScreen({ items }: { items: ListingCardData[] }) {
  const favorites = useStoredIds("hh.favorites");
  const recent = useStoredIds("hh.recent");
  const saved = items.filter((item) => favorites.ids.includes(item.id));
  const seen = recent.ids.map((id) => items.find((item) => item.id === id)).filter((item) => item !== undefined);

  if (!favorites.ready) return <p className="mt-6 text-sm text-muted-foreground">Открываем локальный список…</p>;

  return (
    <div className="mt-5 space-y-10">
      {saved.length === 0 ? (
        <EmptyState
          title="В избранном пока пусто"
          text="Нажмите на сердце на карточке, чтобы сохранить её здесь."
          action={<Link href="/" className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">К объявлениям</Link>}
        />
      ) : (
        <div className={grid}>
          {saved.map((item) => <ListingCard key={item.id} item={item} />)}
        </div>
      )}
      {seen.length > 0 ? (
        <section aria-labelledby="recent">
          <h2 id="recent" className="mb-3 text-[22px] leading-7 font-bold">Недавно просмотренные</h2>
          <div className={grid}>
            {seen.slice(0, 10).map((item) => <ListingCard key={item.id} item={item} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
