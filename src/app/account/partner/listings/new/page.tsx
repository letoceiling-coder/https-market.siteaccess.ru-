import type { Metadata } from "next";
import { ClassifiedWizard, type WizardCategory } from "@/components/account/classified-wizard";
import { getRegions } from "@/services/catalog";
import { getAttributes, getTaxonNodes, getTaxonRoots } from "@/services/classified";

export const metadata: Metadata = { title: "Новое объявление" };

export default function NewListingPage() {
  const roots = new Map(getTaxonRoots().map((item) => [item.slug, item.name]));
  const nodes = getTaxonNodes();
  const parents = new Set(nodes.map((item) => item.parentId).filter((item): item is string => Boolean(item)));
  const categories: WizardCategory[] = nodes
    .filter((item) => !parents.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      group: roots.get(item.path.split("/")[0]) ?? item.name,
      kind: item.listingKind,
      attributes: getAttributes(item),
    }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Новое объявление</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Десять шагов собирают локальный черновик. Поля зависят от категории. Публикация на сервер не выполняется.
      </p>
      <div className="mt-6">
        <ClassifiedWizard initialId={null} categories={categories} regions={getRegions().map((item) => ({ id: item.id, name: item.name }))} />
      </div>
    </div>
  );
}
