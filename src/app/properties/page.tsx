import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PropertyFiltersForm } from "@/components/catalog/property-filters";
import { PropertyCard } from "@/components/site/cards";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/site/states";
import { filterProperties, getRegions, paginate, parsePropertyFilters, propertyFacets } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Дома, коттеджи и участки",
  description: "Учебный каталог с фильтрами. Карточки не являются объявлениями о продаже.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function PropertiesPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PropertyScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function PropertyScreen({ searchParams }: { searchParams: Search }) {
  const filters = parsePropertyFilters(await searchParams);
  if (filters.state === "error") {
    return (
      <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
        <ErrorState text="Это учебное состояние ошибки. Повторите без параметра state." />
        <Link href="/properties" className="mt-4 inline-block text-primary">Повторить без ошибки</Link>
      </div>
    );
  }
  const matched = filterProperties(filters);
  const page = paginate(matched, filters.page);
  const facets = propertyFacets();

  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Дома, коттеджи и участки</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        Все карточки — демонстрация интерфейса. Адреса, цены и продавцы не публикуются, потому что объектов продажи нет.
      </p>
      <div className="mt-4 flex gap-2">
        <Link href={`/properties?${viewQuery(filters, "grid")}`} className="rounded-lg border border-border px-3 py-2 text-sm" aria-current={filters.view === "grid" ? "page" : undefined}>Сетка</Link>
        <Link href={`/properties?${viewQuery(filters, "list")}`} className="rounded-lg border border-border px-3 py-2 text-sm" aria-current={filters.view === "list" ? "page" : undefined}>Список</Link>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <PropertyFiltersForm filters={filters} regions={getRegions()} facets={facets} />
        <div>
          {page.items.length === 0 ? (
            <EmptyState title="Ничего не нашлось" text="Сбросьте фильтры или уберите цену: у образцов цены нет." action={<Link href="/properties" className="text-primary">Сбросить</Link>} />
          ) : (
            <div className={filters.view === "list" ? "space-y-3" : "grid grid-cols-2 gap-x-3 gap-y-6 xl:grid-cols-3 2xl:grid-cols-4"}>
              {page.items.map((item) => <PropertyCard key={item.id} property={item} view={filters.view} />)}
            </div>
          )}
          <nav aria-label="Страницы каталога" className="mt-6 flex gap-2">
            {Array.from({ length: page.pages }, (_, index) => {
              const number = index + 1;
              return (
                <Link key={number} href={`/properties?${pageQuery(filters, number)}`} aria-current={number === page.current ? "page" : undefined} className="rounded-lg border border-border px-3 py-2 text-sm">
                  {number}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

function viewQuery(filters: ReturnType<typeof parsePropertyFilters>, view: "grid" | "list") {
  return pageQuery({ ...filters, view, page: 1 }, 1);
}

function pageQuery(filters: ReturnType<typeof parsePropertyFilters>, page: number) {
  const params = new URLSearchParams();
  if (filters.kind !== "all") params.set("kind", filters.kind);
  if (filters.region) params.set("region", filters.region);
  if (filters.areaMin !== null) params.set("areaMin", String(filters.areaMin));
  if (filters.areaMax !== null) params.set("areaMax", String(filters.areaMax));
  if (filters.priceMin !== null) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== null) params.set("priceMax", String(filters.priceMax));
  if (filters.purpose) params.set("purpose", filters.purpose);
  if (filters.readiness) params.set("readiness", filters.readiness);
  if (filters.wall) params.set("wall", filters.wall);
  if (filters.water) params.set("water", "1");
  if (filters.heating) params.set("heating", "1");
  if (filters.gas) params.set("gas", "1");
  if (filters.electricity) params.set("electricity", "1");
  if (filters.sewage) params.set("sewage", "1");
  if (filters.sort !== "title") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}
