"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readListings, upsertListing, type ListingDraft } from "@/components/account/listing-store";
import type { CategoryAttribute } from "@/domain/classified";
import { useClientReady } from "@/hooks/storage";
import { ScrollRail } from "@/components/site/scroll-rail";

export type WizardCategory = {
  id: string;
  name: string;
  group: string;
  kind: string;
  attributes: CategoryAttribute[];
};

const steps = ["Категория", "Тип", "Характеристики", "Фото", "Описание", "Цена", "Регион", "Контакты", "Предпросмотр", "Отправка"];

export function ClassifiedWizard({
  initialId,
  categories,
  regions,
}: {
  initialId: string | null;
  categories: WizardCategory[];
  regions: { id: string; name: string }[];
}) {
  const ready = useClientReady();
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [local, setLocal] = useState<ListingDraft | null>(null);
  const stored = ready && initialId ? readListings().find((item) => item.id === initialId) ?? null : null;
  if (ready && !initialId && !local) setLocal(blank(categories[0]?.id ?? "", regions[0]?.id ?? ""));
  const draft = local ?? stored;
  const category = categories.find((item) => item.id === draft?.category) ?? categories[0];

  function patch(part: Partial<ListingDraft>) {
    if (!draft) return;
    setLocal({ ...draft, ...part });
    setError("");
  }

  function save() {
    if (!draft) return;
    const next = { ...draft, updatedAt: new Date().toISOString() };
    upsertListing(next);
    setLocal(next);
    setNotice("Черновик записан в этом браузере. На сервер он не ушёл.");
  }

  function next() {
    const problem = validate(step, draft, category);
    if (problem) {
      setError(problem);
      return;
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  if (!ready || !draft || !category) return <p className="text-sm text-muted-foreground">Открываем черновик…</p>;

  const groups = [...new Set(categories.map((item) => item.group))];

  return (
    <div className="space-y-5">
      <ScrollRail label="Шаги объявления" trackClassName="gap-2 py-1">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={index === step ? "shrink-0 rounded-full bg-primary px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white" : "shrink-0 rounded-full border border-border bg-card px-3.5 py-2 text-sm whitespace-nowrap"}
            aria-current={index === step ? "step" : undefined}
            onClick={() => setStep(index)}
          >
            {index + 1}. {label}
          </button>
        ))}
      </ScrollRail>
      {step === 0 ? (
        <Field label="Категория">
          <select className="h-11 w-full rounded-lg border border-input bg-white px-3" value={draft.category} onChange={(event) => patch({ category: event.target.value, attributes: {} })}>
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {categories.filter((item) => item.group === group).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
      ) : null}
      {step === 1 ? <p className="rounded-xl bg-white p-4 text-sm">Тип объявления: {category.kind}. Поля ниже взяты из справочника этой категории.</p> : null}
      {step === 2 ? (
        <div className="space-y-3">
          {category.attributes.map((attribute) => (
            <Field key={attribute.id} label={attribute.name}>
              {attribute.kind === "select" ? (
                <select className="h-11 w-full rounded-lg border border-input bg-white px-3" value={draft.attributes?.[attribute.id] ?? ""} onChange={(event) => patch({ attributes: { ...draft.attributes, [attribute.id]: event.target.value } })}>
                  <option value="">Не выбрано</option>
                  {attribute.options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              ) : (
                <Input value={draft.attributes?.[attribute.id] ?? ""} onChange={(event) => patch({ attributes: { ...draft.attributes, [attribute.id]: event.target.value } })} />
              )}
            </Field>
          ))}
        </div>
      ) : null}
      {step === 3 ? <p className="rounded-xl bg-white p-4 text-sm leading-6">Загрузка файлов на сервер не подключена. Фото останется пустым, чтобы не сохранять чужой снимок как фото объявления.</p> : null}
      {step === 4 ? (
        <div className="space-y-3">
          <Field label="Заголовок"><Input value={draft.title} onChange={(event) => patch({ title: event.target.value })} /></Field>
          <Field label="Описание"><Textarea value={draft.text} onChange={(event) => patch({ text: event.target.value })} /></Field>
        </div>
      ) : null}
      {step === 5 ? (
        <Field label="Цена, если хотите сохранить её в черновике">
          <Input value={draft.priceNote ?? ""} onChange={(event) => patch({ priceNote: event.target.value })} placeholder="Можно оставить пустым" />
        </Field>
      ) : null}
      {step === 6 ? (
        <Field label="Регион">
          <select className="h-11 w-full rounded-lg border border-input bg-white px-3" value={draft.region} onChange={(event) => patch({ region: event.target.value })}>
            {regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
      ) : null}
      {step === 7 ? (
        <div className="space-y-3">
          <Field label="Имя для черновика"><Input value={draft.contactName ?? ""} onChange={(event) => patch({ contactName: event.target.value })} /></Field>
          <Field label="Телефон"><Input value={draft.contactPhone ?? ""} inputMode="tel" onChange={(event) => patch({ contactPhone: event.target.value })} /></Field>
          <p className="text-xs text-muted-foreground">Контакты остаются в браузере и не уходят на сервер.</p>
        </div>
      ) : null}
      {step === 8 ? (
        <div className="rounded-xl bg-white p-4 text-sm leading-6">
          <p className="font-semibold">{draft.title || "Без заголовка"}</p>
          <p className="mt-2">{category.name}</p>
          <p className="mt-2">{draft.text || "Описание пустое"}</p>
          <p className="mt-2">Цена в черновике: {draft.priceNote || "не указана"}</p>
        </div>
      ) : null}
      {step === 9 ? <p className="rounded-xl bg-white p-4 text-sm">Отправка ставит черновик в ожидание. Публикации нет, пока API модерации не подключён.</p> : null}
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {notice ? <p className="text-sm text-primary" role="status">{notice}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setStep((value) => Math.max(0, value - 1))}>Назад</Button>
        {step < 9 ? <Button type="button" onClick={next}>Дальше</Button> : <Button type="button" onClick={() => { save(); setNotice("API не подключён. Объявление не опубликовано и остаётся черновиком."); }}>Отправить на публикацию</Button>}
        <Button type="button" variant="secondary" onClick={save}>Сохранить черновик</Button>
      </div>
    </div>
  );
}

function validate(step: number, draft: ListingDraft | null, category: WizardCategory | undefined) {
  if (!draft || !category) return "Черновик не открыт.";
  if (step === 2) {
    const missing = category.attributes.find((item) => item.required && !draft.attributes?.[item.id]);
    if (missing) return `Заполните поле «${missing.name}».`;
  }
  if (step === 4 && draft.title.trim().length < 4) return "Заголовок должен быть не короче 4 символов.";
  if (step === 7 && draft.contactPhone && !/^[\d+\-\s()]{6,}$/.test(draft.contactPhone)) return "Телефон выглядит неполным.";
  return "";
}

function blank(category: string, region: string): ListingDraft {
  return {
    id: `draft-${Date.now()}`,
    title: "",
    category,
    region,
    details: "",
    text: "",
    photoId: "",
    attributes: {},
    priceNote: "",
    contactName: "",
    contactPhone: "",
    updatedAt: new Date().toISOString(),
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div>{children}</div>
    </div>
  );
}
