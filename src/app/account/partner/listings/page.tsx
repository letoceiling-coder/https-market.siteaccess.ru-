import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingEditor } from "@/components/account/listing-editor";
import { ListingsBoard } from "@/components/account/listings-board";
import { PageSkeleton } from "@/components/site/states";
import { getCategories, getMedia, getRegions } from "@/services/catalog";

export const metadata: Metadata = { title: "Объявления партнёра" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function ListingsPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ListingsScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function ListingsScreen({ searchParams }: { searchParams: Search }) {
  const raw = (await searchParams).id;
  const id = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  const photos = ["house-wood", "house-brick", "kitchen", "bathroom", "construction", "field"].map((item) => getMedia(item));
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Объявления</h1>
        <Link href="/account/partner/listings/new" className="text-sm text-primary">Новый черновик</Link>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Публикация недоступна, пока нет API. Кнопка «Опубликовать» это прямо говорит и не меняет статус на опубликованный.</p>
      <div className="mt-6"><ListingsBoard /></div>
      {id ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Редактирование черновика</h2>
          <div className="mt-4">
            <ListingEditor
              initialId={id}
              categories={getCategories().map((item) => ({ id: item.id, name: item.name }))}
              regions={getRegions().map((item) => ({ id: item.id, name: item.name }))}
              photos={photos}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
