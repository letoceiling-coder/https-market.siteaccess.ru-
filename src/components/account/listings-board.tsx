"use client";

import Link from "next/link";
import { EmptyState } from "@/components/site/states";
import { useListingDrafts } from "@/components/account/listing-store";

export function ListingsBoard() {
  const { ready, value: items } = useListingDrafts();

  if (!ready) return <p className="text-sm text-muted-foreground">Читаем черновики браузера…</p>;
  if (items.length === 0) {
    return <EmptyState title="Черновиков нет" text="Объявление сохранится только на этом устройстве." action={<Link href="/account/partner/listings/new" className="text-primary">Создать черновик</Link>} />;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-primary">Черновик · не опубликовано</p>
          <h2 className="mt-1 text-lg font-semibold">{item.title || "Без заголовка"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.text || "Текст не заполнен"}</p>
          <Link href={`/account/partner/listings?id=${item.id}`} className="mt-3 inline-block text-sm text-primary">Открыть</Link>
        </li>
      ))}
    </ul>
  );
}

export function DraftCount() {
  const { ready, value } = useListingDrafts();
  return <span>{ready ? value.length : "…"}</span>;
}
