import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DemoBanner } from "@/components/classified/demo-banner";
import { DemoCard } from "@/components/classified/demo-card";
import { ListingGrid } from "@/components/site/cards";
import { ClientForm } from "@/components/site/client-form";
import { EmptyState, PageSkeleton } from "@/components/site/states";
import { searchCatalog } from "@/services/catalog";
import { getDemos, searchDemos, sortDemos } from "@/services/classified";

export const metadata: Metadata = { title: "Поиск", description: "Поиск по объявлениям, услугам и разделам." };

type Search = Promise<Record<string, string | string[] | undefined>>;

const labels = {
  category: "Направление",
  service: "Услуга",
  article: "Статья",
  property: "Образец недвижимости",
  calculator: "Калькулятор",
  listing: "Объявление",
  page: "Раздел",
};

const sorts = [
  ["new", "Новые"],
  ["price-asc", "Дешевле"],
  ["price-desc", "Дороже"],
] as const;

export default function SearchPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SearchScreen searchParams={searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function SearchScreen({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const sort = first(params.sort) || "new";
  const listings = query ? sortDemos(searchDemos(getDemos(), query), sort) : [];
  const sections = query ? searchCatalog(query) : [];
  const empty = query && listings.length === 0 && sections.length === 0;

  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-[24px] leading-8 font-bold">{query ? `Результаты по запросу «${query}»` : "Поиск"}</h1>
      <ClientForm action="/search" className="mt-3 hidden max-w-3xl gap-2 lg:flex" role="search">
        <label className="sr-only" htmlFor="q">Запрос</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="q" name="q" defaultValue={query} placeholder="Что вы ищете?" className="h-12 w-full rounded-xl border border-input-strong bg-white pr-3 pl-10 text-[16px] outline-none focus:border-primary" />
        </div>
        {sort !== "new" ? <input type="hidden" name="sort" value={sort} /> : null}
        <button className="h-12 rounded-xl bg-primary px-6 text-[15px] font-semibold text-white" type="submit">Найти</button>
      </ClientForm>

      {!query ? <p className="mt-6 text-muted-foreground">Введите название товара, услуги или раздела.</p> : null}
      {empty ? (
        <div className="mt-6">
          <EmptyState title="Ничего не нашлось" text="Попробуйте другое слово или откройте каталог." action={<Link href="/catalog" className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">Все категории</Link>} />
        </div>
      ) : null}

      {listings.length > 0 ? (
        <section className="mt-5" aria-labelledby="found">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="found" className="text-[20px] leading-6 font-bold">Объявления · {listings.length}</h2>
              <DemoBanner />
            </div>
            <nav aria-label="Сортировка" className="flex gap-1">
              {sorts.map(([id, label]) => (
                <Link
                  key={id}
                  href={`/search?q=${encodeURIComponent(query)}&sort=${id}`}
                  aria-current={sort === id ? "true" : undefined}
                  className={sort === id ? "rounded-lg bg-foreground px-3 py-1.5 text-[13px] text-white" : "rounded-lg bg-tile px-3 py-1.5 text-[13px] hover:text-primary"}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <ListingGrid>{listings.map((item) => <DemoCard key={item.id} item={item} />)}</ListingGrid>
        </section>
      ) : null}

      {sections.length > 0 ? (
        <section className="mt-8" aria-labelledby="sections">
          <h2 id="sections" className="mb-2 text-[20px] leading-6 font-bold">Разделы и материалы</h2>
          <ul className="max-w-3xl divide-y divide-border">
            {sections.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link href={item.href} className="block py-3 hover:text-primary">
                  <span className="block text-xs text-muted-foreground">{labels[item.type]}</span>
                  <span className="text-[16px] font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
