import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogResults } from "@/components/classified/catalog-results";
import { DemoBanner } from "@/components/classified/demo-banner";
import { FilterWorkspace } from "@/components/classified/filter-workspace";
import { SaveFilterButton } from "@/components/classified/save-filter";
import { Crumbs } from "@/components/site/crumbs";
import { EmptyState, PageSkeleton } from "@/components/site/states";
import { ScrollRail } from "@/components/site/scroll-rail";
import {
  demosForNode,
  filterDemos,
  getAttributes,
  getTaxon,
  getTaxonBreadcrumb,
  getTaxonChildren,
  getTaxonNodes,
  searchDemos,
  sortDemos,
} from "@/services/classified";

type Params = Promise<{ slug: string[] }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export function generateStaticParams() {
  return getTaxonNodes().map((node) => ({ slug: node.path.split("/") }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const node = getTaxon((await params).slug.join("/"));
  if (!node) return { title: "Раздел не найден" };
  return { title: node.seoTitle, description: node.seoDescription };
}

export default function CatalogNodePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CatalogNode params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CatalogNode({ params, searchParams }: { params: Params; searchParams: Search }) {
  const slug = (await params).slug;
  const query = await searchParams;
  const path = slug.join("/");
  const node = getTaxon(path);
  if (!node) notFound();
  const flat = flatten(query);
  const children = getTaxonChildren(node.id);
  const attributes = getAttributes(node);
  const matched = sortDemos(searchDemos(filterDemos(demosForNode(node), flat), flat.q ?? ""), flat.sort);
  const hasDemos = demosForNode(node).length > 0;
  const blocked = Boolean(flat.radius);
  const crumbs = getTaxonBreadcrumb(node);
  const href = currentHref(path, flat);
  const action = `/catalog/${path}`;

  return (
    <div className="mx-auto max-w-[1348px] px-3 py-3 sm:px-4">
      <Crumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/catalog", label: "Категории" },
          ...crumbs.map((item, index) => ({
            href: index === crumbs.length - 1 ? undefined : `/catalog/${item.path}`,
            label: item.name,
          })),
        ]}
      />
      <div className="mt-3 flex items-end justify-between gap-3">
        <h1 className="text-[22px] leading-7 font-bold">{node.name}</h1>
        <p className="text-sm text-muted-foreground">
          {blocked ? 0 : matched.length} {plural(blocked ? 0 : matched.length)}
        </p>
      </div>
      {children.length > 0 ? (
        <ScrollRail label="Подкатегории" className="-mx-4 mt-3 lg:mx-0" trackClassName="gap-2 px-4 py-1 lg:px-0">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/catalog/${child.path}`}
              className="press inline-flex h-9 shrink-0 items-center rounded-full bg-card px-4 text-[14px] font-medium whitespace-nowrap shadow-[0_1px_0_var(--border)] hover:text-primary"
            >
              {child.name}
            </Link>
          ))}
        </ScrollRail>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        <FilterWorkspace action={action} values={flat} attributes={attributes} count={matched.length}>
          <label className="block text-sm">
            <span className="text-muted-foreground">Название</span>
            <input name="q" defaultValue={flat.q ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3" />
          </label>
          {attributes.filter((item) => item.filter && item.kind === "select").map((item) => (
            <label key={item.id} className="block text-sm">
              <span className="text-muted-foreground">{item.name}</span>
              <select name={item.id} defaultValue={flat[item.id] ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3">
                <option value="">Любое</option>
                {item.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {attributes.filter((item) => item.filter && item.kind === "number").map((item) => (
            <div key={item.id} className="grid grid-cols-2 gap-2">
              <label className="text-sm">
                <span className="text-muted-foreground">{item.name} от</span>
                <input name={`${item.id}Min`} inputMode="numeric" defaultValue={flat[`${item.id}Min`] ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3" />
              </label>
              <label className="text-sm">
                <span className="text-muted-foreground">до</span>
                <input name={`${item.id}Max`} inputMode="numeric" defaultValue={flat[`${item.id}Max`] ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3" />
              </label>
            </div>
          ))}
          {attributes.filter((item) => item.filter && item.kind === "text").map((item) => (
            <label key={item.id} className="block text-sm">
              <span className="text-muted-foreground">{item.name}</span>
              <input name={item.id} defaultValue={flat[item.id] ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3" />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              <span className="text-muted-foreground">Цена от</span>
              <input name="priceMin" inputMode="numeric" defaultValue={flat.priceMin ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3" />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Цена до</span>
              <input name="priceMax" inputMode="numeric" defaultValue={flat.priceMax ?? ""} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-muted-foreground">Сортировка</span>
            <select name="sort" defaultValue={flat.sort ?? "new"} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3">
              <option value="new">Сначала новые</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              {node.sorts.includes("area") ? <option value="area">По площади</option> : null}
              {node.sorts.includes("year") ? <option value="year">По году</option> : null}
            </select>
          </label>
          <button className="h-10 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">
            Показать
          </button>
          <Link href={action} className="block text-center text-sm text-primary">
            Сбросить
          </Link>
          <SaveFilterButton href={href} label={node.name} />
        </FilterWorkspace>

        <div>
          {hasDemos ? (
            <div className="mb-3">
              <DemoBanner />
            </div>
          ) : null}
          {blocked ? (
            <EmptyState title="Поиск по радиусу недоступен" text="У карточек нет координат, поэтому радиус не может быть применён честно. Уберите радиус, чтобы увидеть результаты." />
          ) : null}
          <CatalogResults items={matched} hasDemos={hasDemos} blocked={blocked} resetHref={action} />
          <p className="mt-4 text-sm">
            <Link href="/map" className="text-primary">
              Карта объявлений
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function plural(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "объявление";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объявления";
  return "объявлений";
}

function flatten(query: Record<string, string | string[] | undefined>) {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    const raw = Array.isArray(value) ? value[0] ?? "" : value ?? "";
    if (raw) result[key] = raw;
  }
  return result;
}

function currentHref(path: string, query: Record<string, string>) {
  const params = new URLSearchParams(query);
  const text = params.toString();
  return text ? `/catalog/${path}?${text}` : `/catalog/${path}`;
}
