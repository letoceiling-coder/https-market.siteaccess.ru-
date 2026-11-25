"use client";

import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Photo } from "@/components/site/photo";
import type { MediaAsset } from "@/domain/types";
import { readListings, upsertListing, type ListingDraft } from "@/components/account/listing-store";
import { useClientReady } from "@/hooks/storage";

const steps = ["Направление", "Параметры", "Текст", "Фото", "Предпросмотр"];

export function ListingEditor({
  initialId,
  categories,
  regions,
  photos,
}: {
  initialId: string | null;
  categories: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  photos: MediaAsset[];
}) {
  const ready = useClientReady();
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState("");
  const [local, setLocal] = useState<ListingDraft | null>(null);
  const stored = ready && initialId ? readListings().find((item) => item.id === initialId) ?? null : null;

  if (ready && !initialId && !local) {
    setLocal(blank(categories[0]?.id ?? "", regions[0]?.id ?? "", photos[0]?.id ?? ""));
  }

  const draft = local ?? stored;

  function patch(part: Partial<ListingDraft>) {
    if (!draft) return;
    setLocal({ ...draft, ...part });
  }

  function save() {
    if (!draft) return;
    const next = { ...draft, updatedAt: new Date().toISOString() };
    upsertListing(next);
    setLocal(next);
    setNotice("Черновик записан в этом браузере. На сервер он не ушёл.");
  }

  function holdPublish() {
    save();
    setNotice("API не подключён. Объявление не опубликовано и остаётся черновиком.");
  }

  if (!ready || (!initialId && !local)) return <p className="text-sm text-muted-foreground">Открываем черновик…</p>;
  if (!draft) {
    return <p className="rounded-xl bg-secondary p-4 text-sm leading-6">Черновик с этим идентификатором в браузере не найден.</p>;
  }

  const photo = photos.find((item) => item.id === draft.photoId) ?? photos[0];

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2" aria-label="Шаги объявления">
        {steps.map((label, index) => (
          <li key={label}>
            <button type="button" className="rounded-full border border-border px-3 py-2 text-sm" aria-current={index === step ? "step" : undefined} onClick={() => setStep(index)}>
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>
      {step === 0 ? (
        <Field label="Направление">
          <select className="h-11 w-full rounded-lg border border-input bg-card px-3" value={draft.category} onChange={(event) => patch({ category: event.target.value })}>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
      ) : null}
      {step === 1 ? (
        <div className="space-y-4">
          <Field label="Регион показа в макете">
            <select className="h-11 w-full rounded-lg border border-input bg-card px-3" value={draft.region} onChange={(event) => patch({ region: event.target.value })}>
              {regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Параметры, которые позже уйдут в API">
            <Textarea rows={4} value={draft.details} onChange={(event) => patch({ details: event.target.value })} />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="space-y-4">
          <Field label="Заголовок">
            <Input className="h-11" value={draft.title} onChange={(event) => patch({ title: event.target.value })} />
          </Field>
          <Field label="Текст">
            <Textarea rows={6} value={draft.text} onChange={(event) => patch({ text: event.target.value })} />
          </Field>
        </div>
      ) : null}
      {step === 3 && photo ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">Файлы на сервер не загружаются. Можно выбрать уже лежащую в проекте иллюстрацию.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((item) => (
              <button key={item.id} type="button" className="overflow-hidden rounded-xl border border-border text-left" aria-pressed={item.id === draft.photoId} onClick={() => patch({ photoId: item.id })}>
                <div className="relative aspect-[4/3]"><Photo media={item} /></div>
                <span className="block p-2 text-xs">{item.alt}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {step === 4 && photo ? (
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs tracking-wide text-primary uppercase">Черновик · не опубликовано</p>
          <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl"><Photo media={photo} /></div>
          <h2 className="mt-4 text-2xl font-semibold">{draft.title || "Без заголовка"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{categories.find((item) => item.id === draft.category)?.name} · {regions.find((item) => item.id === draft.region)?.name}</p>
          <p className="mt-3 leading-7">{draft.text || "Текст ещё не заполнен."}</p>
          <p className="mt-3 text-sm">{draft.details}</p>
          <p className="mt-4 text-sm font-medium">Цена не указывается: прайса нет.</p>
        </article>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="h-11" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Назад</Button>
        {step < 4 ? <Button type="button" className="h-11" onClick={() => setStep((value) => value + 1)}>Дальше</Button> : null}
        <Button type="button" variant="secondary" className="h-11" onClick={save}>Сохранить черновик</Button>
        <Button type="button" className="h-11" onClick={holdPublish}>Опубликовать</Button>
      </div>
      {notice ? <p role="status" className="rounded-xl bg-secondary p-4 text-sm leading-6">{notice}</p> : null}
    </div>
  );
}

function blank(category: string, region: string, photoId: string): ListingDraft {
  return {
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : `draft-${Date.now()}`,
    title: "",
    category,
    region,
    details: "",
    text: "",
    photoId,
    updatedAt: "",
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {control}
    </div>
  );
}
