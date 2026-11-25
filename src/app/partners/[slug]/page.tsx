import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Crumbs } from "@/components/site/crumbs";
import { Photo, PhotoCredit } from "@/components/site/photo";
import { PageSkeleton } from "@/components/site/states";
import { getCategories, getCompanies, getCompany, getMedia } from "@/services/catalog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getCompanies().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const company = getCompany((await params).slug);
  if (!company) return { title: "Профиль не найден" };
  return { title: company.name, description: company.summary, robots: { index: false, follow: true } };
}

export default function PartnerPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PartnerScreen params={params} />
    </Suspense>
  );
}

async function PartnerScreen({ params }: { params: Params }) {
  const company = getCompany((await params).slug);
  if (!company) notFound();
  const media = getMedia(company.imageId);
  const directions = getCategories().filter((item) => company.directions.includes(item.id));
  return (
    <article className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <Crumbs items={[{ href: "/", label: "Главная" }, { href: "/partners", label: "Партнёры" }, { label: company.name }]} />
      <p className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm leading-6">{company.origin.note}</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="mt-4 leading-7 text-muted-foreground">{company.summary}</p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-secondary p-4"><dt className="text-sm text-muted-foreground">Контакты</dt><dd>не опубликованы</dd></div>
            <div className="rounded-xl bg-secondary p-4"><dt className="text-sm text-muted-foreground">Портфолио компании</dt><dd>не опубликовано</dd></div>
            <div className="rounded-xl bg-secondary p-4"><dt className="text-sm text-muted-foreground">Регионы работы</dt><dd>{company.regions.length ? company.regions.join(", ") : "не указаны"}</dd></div>
            <div className="rounded-xl bg-secondary p-4"><dt className="text-sm text-muted-foreground">Статус</dt><dd>макет, не партнёр</dd></div>
          </dl>
          <h2 className="mt-8 text-2xl font-semibold">Направления макета</h2>
          <ul className="mt-3 space-y-2">
            {directions.map((item) => (
              <li key={item.id}><Link className="text-primary" href={`/services/${item.slug}`}>{item.name}</Link></li>
            ))}
          </ul>
        </div>
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Photo media={media} /></div>
          <figcaption className="mt-2"><PhotoCredit media={media} /></figcaption>
        </figure>
      </div>
    </article>
  );
}
