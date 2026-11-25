import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingGrid, ServiceCard } from "@/components/site/cards";
import { CategoryBoard, type CategoryTile } from "@/components/site/category-board";
import { PageSkeleton } from "@/components/site/states";
import { normalize } from "@/domain/text";
import { getCategories, getMedia, getServices } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Каталог услуг",
  description: "Направления и справочные работы. Прайс не опубликован.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function ServicesPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServicesScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function ServicesScreen({ searchParams }: { searchParams: Search }) {
  const query = await searchParams;
  const raw = Array.isArray(query.q) ? query.q[0] ?? "" : query.q ?? "";
  const sort = Array.isArray(query.sort) ? query.sort[0] ?? "name" : query.sort ?? "name";
  const needle = normalize(raw);
  const categories = getCategories();
  const tiles: CategoryTile[] = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    media: getMedia(category.imageId),
    services: getServices(category.id).map((service) => ({ slug: service.slug, name: service.name })),
  }));
  const services = getServices()
    .filter((item) => (needle ? normalize(`${item.name} ${item.summary}`).includes(needle) : true))
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name, "ru") : a.categoryId.localeCompare(b.categoryId, "ru") || a.name.localeCompare(b.name, "ru")));

  return (
    <div className="mx-auto max-w-[1348px] px-3 py-4 sm:px-4">
      <h1 className="text-xl font-bold sm:text-2xl">Услуги</h1>
      <p className="mt-1 text-sm text-muted-foreground">Двенадцать направлений. Тексты справочные, стоимость по запросу.</p>
      <div className="mt-4"><CategoryBoard tiles={tiles} /></div>
      <form action="/services" className="mt-5 flex flex-col gap-2 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="service-q">Фильтр работ</label>
        <input id="service-q" name="q" defaultValue={raw} placeholder="Название работы" className="h-11 flex-1 rounded-xl border border-input bg-white px-3" />
        <select name="sort" defaultValue={sort === "category" ? "category" : "name"} className="h-11 rounded-xl border border-input bg-white px-3 text-sm" aria-label="Сортировка">
          <option value="name">По названию</option>
          <option value="category">По направлению</option>
        </select>
        <button className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground" type="submit">Показать</button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">{services.length} работ</p>
      <div className="mt-3">
        {services.length === 0 ? <p className="text-sm text-muted-foreground">Ничего не нашлось.</p> : (
          <ListingGrid>{services.map((service) => <ServiceCard key={service.id} service={service} />)}</ListingGrid>
        )}
      </div>
    </div>
  );
}
