import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/states";
import { getAdvertising, getPlacement } from "@/services/catalog";

export const metadata: Metadata = { title: "Рекламные размещения", description: "Форматы рекламы без тарифов." };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function AdvertisingPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdvertisingScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function AdvertisingScreen({ searchParams }: { searchParams: Search }) {
  const raw = (await searchParams).placement;
  const slug = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  const current = slug ? getPlacement(slug) : getAdvertising()[0];
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Рекламные размещения</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">Тарифы не утверждены, поэтому цена каждого формата не публикуется. Ниже — как блок будет отделён от справочника.</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {getAdvertising().map((item) => (
          <li key={item.id}>
            <Link href={`/advertising?placement=${item.slug}`} aria-current={item.slug === current.slug ? "page" : undefined} className="rounded-full border border-border px-4 py-2 text-sm">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-2xl font-semibold">{current.name}</h2>
          <p className="mt-3 leading-7">{current.summary}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div><dt className="text-muted-foreground">Место</dt><dd>{current.where}</dd></div>
            <div><dt className="text-muted-foreground">Формат</dt><dd>{current.format}</dd></div>
            <div><dt className="text-muted-foreground">Цена</dt><dd>не публикуется</dd></div>
          </dl>
          <ul className="mt-4 space-y-2 text-sm">{current.rules.map((rule) => <li key={rule}>— {rule}</li>)}</ul>
        </article>
        <div className="rounded-2xl border border-dashed border-primary bg-[#f7fbfa] p-5">
          <p className="text-xs tracking-wide text-primary uppercase">Реклама · предпросмотр</p>
          <p className="mt-3 text-2xl font-semibold">{current.name}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Здесь будет материал рекламодателя после модерации. Сейчас это пустой макет, он не ведёт на сторонний сайт.</p>
          <p className="mt-6 text-sm">Формат: {current.format}</p>
        </div>
      </section>
    </div>
  );
}
