"use client";

import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ClientForm } from "@/components/site/client-form";
import type { PropertyFilters } from "@/services/catalog";

type Facets = { purposes: string[]; readiness: string[]; walls: string[] };
type RegionOption = { id: string; name: string };

export function PropertyFiltersForm({
  filters,
  regions,
  facets,
}: {
  filters: PropertyFilters;
  regions: RegionOption[];
  facets: Facets;
}) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const apply = () => setMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const fields = <Fields filters={filters} regions={regions} facets={facets} />;
  if (!mobile) return <aside className="space-y-4 lg:sticky lg:top-[132px]">{fields}</aside>;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="h-11 w-full">
          <SlidersHorizontal /> Фильтры
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,24rem)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">{fields}</div>
      </SheetContent>
    </Sheet>
  );
}

function Fields({ filters, regions, facets }: { filters: PropertyFilters; regions: RegionOption[]; facets: Facets }) {
  return (
    <ClientForm key={JSON.stringify(filters)} action="/properties" className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <Select name="kind" label="Тип" defaultValue={filters.kind} options={[["all", "Все"], ["house", "Дома"], ["cottage", "Коттеджи"], ["land", "Участки"]]} />
      <Select name="region" label="Регион" defaultValue={filters.region} options={[["", "Любой"], ...regions.map((item) => [item.id, item.name] as [string, string])]} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField name="areaMin" label="Площадь от" defaultValue={filters.areaMin} />
        <NumberField name="areaMax" label="Площадь до" defaultValue={filters.areaMax} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField name="priceMin" label="Цена от" defaultValue={filters.priceMin} />
        <NumberField name="priceMax" label="Цена до" defaultValue={filters.priceMax} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">У образцов нет цены. Если заполнить цену, список станет пустым — так фильтр и должен работать.</p>
      <Select name="purpose" label="Назначение" defaultValue={filters.purpose} options={[["", "Любое"], ...facets.purposes.map((item) => [item, item] as [string, string])]} />
      <Select name="readiness" label="Готовность" defaultValue={filters.readiness} options={[["", "Любая"], ...facets.readiness.map((item) => [item, item] as [string, string])]} />
      <Select name="wall" label="Материал" defaultValue={filters.wall} options={[["", "Любой"], ...facets.walls.map((item) => [item, item] as [string, string])]} />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Коммуникации</legend>
        <Check name="water" label="Вода" defaultChecked={filters.water} />
        <Check name="heating" label="Отопление" defaultChecked={filters.heating} />
        <Check name="gas" label="Газ" defaultChecked={filters.gas} />
        <Check name="electricity" label="Электричество" defaultChecked={filters.electricity} />
        <Check name="sewage" label="Канализация" defaultChecked={filters.sewage} />
      </fieldset>
      <Select name="sort" label="Сортировка" defaultValue={filters.sort} options={[["title", "По названию"], ["area_asc", "Площадь по возрастанию"], ["area_desc", "Площадь по убыванию"]]} />
      <input type="hidden" name="view" value={filters.view} />
      <Button type="submit" className="h-11 w-full">Показать</Button>
      <Button asChild variant="ghost" className="h-11 w-full">
        <Link href="/properties">Сбросить</Link>
      </Button>
    </ClientForm>
  );
}

function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: [string, string][] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm">
        {options.map(([value, text]) => (
          <option key={`${name}-${value}`} value={value}>{text}</option>
        ))}
      </select>
    </div>
  );
}

function NumberField({ name, label, defaultValue }: { name: string; label: string; defaultValue: number | null }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} inputMode="numeric" defaultValue={defaultValue ?? ""} className="h-11" />
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} className="size-4 accent-primary" />
      {label}
    </label>
  );
}
