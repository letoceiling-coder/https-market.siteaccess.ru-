import type { Metadata } from "next";
import Link from "next/link";
import { CategoryMosaic } from "@/components/classified/category-mosaic";
import { TaxonIcon } from "@/components/classified/icon";
import { getPolicy, getTaxonChildren, getTaxonRoots } from "@/services/classified";

export const metadata: Metadata = {
  title: "Все категории",
  description: "Справочник направлений объявлений HELP HOMES. Каталог расширяется новыми узлами без смены страниц.",
};

export default function CatalogIndexPage() {
  const policy = getPolicy();
  const roots = getTaxonRoots();
  return (
    <div className="mx-auto max-w-[1348px] px-4 pt-4 pb-10">
      <h1 className="sr-only">Все категории</h1>
      <CategoryMosaic />
      <section className="mt-8" aria-labelledby="all-categories">
        <h2 id="all-categories" className="text-[22px] leading-7 font-bold">Все разделы</h2>
        <div className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {roots.map((root) => (
            <div key={root.id}>
              <Link href={`/catalog/${root.path}`} className="flex items-center gap-2 text-[16px] font-bold hover:text-primary">
                <TaxonIcon name={root.icon} className="size-4 text-primary" />
                {root.name}
              </Link>
              <ul className="mt-2 space-y-1">
                {getTaxonChildren(root.id).slice(0, 7).map((child) => (
                  <li key={child.id}>
                    <Link href={`/catalog/${child.path}`} className="text-[14px] text-muted-foreground hover:text-primary">{child.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-2xl bg-tile p-4">
        <h2 className="text-[16px] font-bold">Что не публикуется</h2>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{policy.note}</p>
        <ul className="mt-2 grid gap-x-6 gap-y-0.5 text-[13px] text-muted-foreground sm:grid-cols-2">
          {policy.banned.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </div>
  );
}
