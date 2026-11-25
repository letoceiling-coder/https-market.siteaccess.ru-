"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ClientForm } from "@/components/site/client-form";
import { useScrollMemory } from "@/hooks/scroll-memory";
import type { CategoryAttribute } from "@/domain/classified";
import { cn } from "cn";
import { ScrollRail } from "@/components/site/scroll-rail";

type Values = Record<string, string>;

export function FilterWorkspace({
  action,
  values,
  attributes,
  count,
  children,
}: {
  action: string;
  values: Values;
  attributes: CategoryAttribute[];
  count: number;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Values>(values);
  useScrollMemory(`hh.scroll:${action}:${new URLSearchParams(values).toString()}`);

  useEffect(() => {
    setDraft(values);
  }, [values]);

  const chips = useMemo(() => buildChips(values, attributes), [values, attributes]);

  function setField(name: string, value: string) {
    setDraft((current) => {
      const next = { ...current };
      if (value) next[name] = value;
      else delete next[name];
      return next;
    });
  }

  function apply(next: Values) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${action}?${query}` : action);
    setOpen(false);
  }

  function reset() {
    setDraft({});
    apply({});
  }

  function removeChip(name: string) {
    const next = { ...values };
    delete next[name];
    if (name === "priceMin") delete next.priceMax;
    apply(next);
  }

  return (
    <div>
      <ScrollRail label="Фильтры" arrows={false} className="-mx-4 mb-3 lg:mx-0" trackClassName="gap-2 px-4 lg:flex-wrap lg:px-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3 text-[13px] font-medium text-white"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Все фильтры
          {chips.length > 0 ? <span className="grid min-w-5 place-items-center rounded-full bg-white/20 px-1.5 text-[11px]">{chips.length}</span> : null}
        </button>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => removeChip(chip.id)}
            className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-accent px-3 text-[13px] text-primary"
          >
            {chip.label}
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ))}
      </ScrollRail>

      <div className="hidden lg:block">
        <ClientForm action={action} className="space-y-3 rounded-2xl bg-tile p-3">
          {children}
        </ClientForm>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Фильтры">
          <div className="flex h-12 items-center justify-between border-b border-border px-2">
            <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(false)} aria-label="Назад">
              <X className="size-5" aria-hidden="true" />
            </button>
            <p className="text-[16px] font-semibold">Фильтры</p>
            <button type="button" className="h-11 px-3 text-[14px] text-primary" onClick={reset}>
              Сбросить
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <Field label="Название">
              <input value={draft.q ?? ""} onChange={(event) => setField("q", event.target.value)} className="h-11 w-full rounded-xl border border-border px-3" />
            </Field>
            {attributes.filter((item) => item.filter && item.kind === "select").map((item) => (
              <Field key={item.id} label={item.name}>
                <select value={draft[item.id] ?? ""} onChange={(event) => setField(item.id, event.target.value)} className="h-11 w-full rounded-xl border border-border px-3">
                  <option value="">Любое</option>
                  {item.options.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </Field>
            ))}
            {attributes.filter((item) => item.filter && item.kind === "number").map((item) => (
              <div key={item.id} className="mb-3 grid grid-cols-2 gap-2">
                <Field label={`${item.name} от`}>
                  <input inputMode="numeric" value={draft[`${item.id}Min`] ?? ""} onChange={(event) => setField(`${item.id}Min`, event.target.value)} className="h-11 w-full rounded-xl border border-border px-3" />
                </Field>
                <Field label="до">
                  <input inputMode="numeric" value={draft[`${item.id}Max`] ?? ""} onChange={(event) => setField(`${item.id}Max`, event.target.value)} className="h-11 w-full rounded-xl border border-border px-3" />
                </Field>
              </div>
            ))}
            {attributes.filter((item) => item.filter && item.kind === "text").map((item) => (
              <Field key={item.id} label={item.name}>
                <input value={draft[item.id] ?? ""} onChange={(event) => setField(item.id, event.target.value)} className="h-11 w-full rounded-xl border border-border px-3" />
              </Field>
            ))}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Field label="Цена от">
                <input inputMode="numeric" value={draft.priceMin ?? ""} onChange={(event) => setField("priceMin", event.target.value)} className="h-11 w-full rounded-xl border border-border px-3" />
              </Field>
              <Field label="Цена до">
                <input inputMode="numeric" value={draft.priceMax ?? ""} onChange={(event) => setField("priceMax", event.target.value)} className="h-11 w-full rounded-xl border border-border px-3" />
              </Field>
            </div>
            <Field label="Сортировка">
              <select value={draft.sort ?? "new"} onChange={(event) => setField("sort", event.target.value)} className="h-11 w-full rounded-xl border border-border px-3">
                <option value="new">Сначала новые</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
              </select>
            </Field>
          </div>
          <div className="border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button type="button" className="h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-white" onClick={() => apply(draft)}>
              Показать результаты
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={cn("mb-3 block text-sm")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function buildChips(values: Values, attributes: CategoryAttribute[]) {
  const chips: { id: string; label: string }[] = [];
  if (values.q) chips.push({ id: "q", label: values.q });
  if (values.priceMin || values.priceMax) chips.push({ id: "priceMin", label: `Цена ${values.priceMin || "…"}–${values.priceMax || "…"}` });
  for (const attribute of attributes.filter((item) => item.filter)) {
    const current = values[attribute.id];
    if (!current) continue;
    const option = attribute.options.find((item) => item.id === current);
    chips.push({ id: attribute.id, label: option?.name ?? current });
  }
  return chips;
}
