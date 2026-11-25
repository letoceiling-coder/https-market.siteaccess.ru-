import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyCard } from "@/components/site/cards";
import { Crumbs } from "@/components/site/crumbs";
import { FavoriteButton } from "@/components/site/favorite-button";
import { Photo, PhotoCredit } from "@/components/site/photo";
import { PreviewForm } from "@/components/site/preview-form";
import { PageSkeleton } from "@/components/site/states";
import { RecentMarker } from "@/components/catalog/recent-marker";
import { getMedia, getProperties, getProperty, getRegion, propertyArea, similarProperties } from "@/services/catalog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getProperties().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const property = getProperty((await params).slug);
  if (!property) return { title: "Карточка не найдена" };
  return { title: property.title, description: property.summary, robots: { index: false, follow: true } };
}

export default function PropertyPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PropertyScreen params={params} />
    </Suspense>
  );
}

async function PropertyScreen({ params }: { params: Params }) {
  const property = getProperty((await params).slug);
  if (!property) notFound();
  const region = getRegion(property.regionId);
  const area = propertyArea(property);
  const comms = property.communications;

  return (
    <article className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <RecentMarker id={property.id} />
      <Crumbs items={[{ href: "/", label: "Главная" }, { href: "/properties", label: "Недвижимость" }, { label: property.title }]} />
      <p className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm leading-6">Демонстрационная карточка. Объект не продаётся, адрес и цена скрыты намеренно.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {property.imageIds.map((id, index) => {
          const media = getMedia(id);
          return (
            <figure key={id} className="overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-[16/10]"><Photo media={media} priority={index === 0} /></div>
              <figcaption className="p-3"><PhotoCredit media={media} /></figcaption>
            </figure>
          );
        })}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
        <div>
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <p className="mt-2 text-xl font-bold">Цена не указана</p>
          <p className="mt-1 text-sm text-muted-foreground">{region?.name ?? "Регион не указан"} · образец, не продаётся</p>
          <p className="mt-4 leading-7 text-muted-foreground">{property.summary}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Fact label="Регион" value={region?.name ?? "не указан"} />
            <Fact label="Точность адреса" value="Только регион, без улицы" />
            <Fact label="Площадь" value={area ? `${area} ${property.kind === "land" ? "соток" : "м²"}` : "не задана"} />
            <Fact label="Участок" value={property.landArea ? `${property.landArea} соток` : "не задан"} />
            <Fact label="Этажи" value={property.floors ? String(property.floors) : "не применимо"} />
            <Fact label="Назначение" value={property.purpose} />
            <Fact label="Готовность" value={property.readiness} />
            <Fact label="Стены" value={property.wallMaterial ?? "не указаны"} />
            <Fact label="Цена" value="не публикуется" />
            <Fact label="Подъезд" value={comms.access} />
          </dl>
          <h2 className="mt-8 text-2xl font-semibold">Коммуникации образца</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Вода: {flag(comms.water)}</li>
            <li>Отопление: {flag(comms.heating)}</li>
            <li>Газ: {flag(comms.gas)}</li>
            <li>Электричество: {flag(comms.electricity)}</li>
            <li>Канализация: {flag(comms.sewage)}</li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{property.documentsNote}</p>
          <p className="mt-4 text-sm leading-6">Карта появится вместе с геоданными API. Сейчас точка на карте не ставится, чтобы не указать чужой адрес.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/services/stroitelstvo" className="rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground">Смотреть строительство</Link>
            <Link href="/services/otoplenie" className="rounded-lg border border-border px-4 py-3 text-sm">Инженерные системы</Link>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">Связь с продавцом</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Кнопка не открывает телефон: продавца у образца нет. Форма показывает, как будет выглядеть обращение.</p>
            <div className="mt-4"><PreviewForm subject={property.title} compact /></div>
          </div>
          <FavoriteButton id={property.id} label={property.title} />
        </aside>
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Похожие образцы</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {similarProperties(property).map((item) => <PropertyCard key={item.id} property={item} />)}
        </div>
      </section>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-secondary p-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}

function flag(value: boolean | null) {
  if (value === null) return "не применимо";
  return value ? "отмечено в образце" : "не отмечено";
}
