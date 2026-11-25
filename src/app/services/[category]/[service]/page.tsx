import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Crumbs } from "@/components/site/crumbs";
import { FavoriteButton } from "@/components/site/favorite-button";
import { JsonLd } from "@/components/site/json-ld";
import { Photo, PhotoCredit } from "@/components/site/photo";
import { PreviewForm } from "@/components/site/preview-form";
import { OriginNote, PageSkeleton } from "@/components/site/states";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCategories, getCategory, getMedia, getRelatedServices, getService, getServices } from "@/services/catalog";

type Params = Promise<{ category: string; service: string }>;

export function generateStaticParams() {
  return getCategories().flatMap((category) =>
    getServices(category.id).map((service) => ({ category: category.slug, service: service.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, service: serviceSlug } = await params;
  const service = getService(category, serviceSlug);
  if (!service) return { title: "Услуга не найдена" };
  return { title: service.name, description: service.summary };
}

export default function ServicePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServiceScreen params={params} />
    </Suspense>
  );
}

async function ServiceScreen({ params }: { params: Params }) {
  const { category: categorySlug, service: serviceSlug } = await params;
  const category = getCategory(categorySlug);
  const service = getService(categorySlug, serviceSlug);
  if (!category || !service) notFound();
  const media = getMedia(service.imageId);
  const related = getRelatedServices(service);

  return (
    <article className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.summary,
          provider: { "@type": "Organization", name: "HELP HOMES", url: "https://helphomes.ru" },
        }}
      />
      <Crumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/services", label: "Услуги" },
          { href: `/services/${category.slug}`, label: category.name },
          { label: service.name },
        ]}
      />
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white">
            <Photo media={media} priority sizes="(min-width: 1024px) 60vw, 100vw" />
          </div>
          <PhotoCredit media={media} />
          <p className="mt-3 text-sm text-muted-foreground">{category.name}</p>
          <h1 className="mt-1 text-2xl font-bold">{service.name}</h1>
          <p className="mt-2 text-xl font-bold">Цена не указана</p>
          <p className="mt-1 text-sm text-muted-foreground">По запросу после обследования. Прайс не опубликован.</p>
          <p className="mt-4 leading-7 text-muted-foreground">{service.description}</p>
          <div className="mt-4">
            <OriginNote text={service.origin.note} />
          </div>
          <Section title="Что входит" items={service.includes} />
          <Section title="Кому подходит" items={service.suitableFor} />
          <Section title="Что нужно до старта" items={service.requirements} />
          <h2 className="mt-10 text-2xl font-semibold">Технология</h2>
          <p className="mt-3 leading-7">{service.technology}</p>
          <h2 className="mt-10 text-2xl font-semibold">Этапы</h2>
          <ol className="mt-4 space-y-4">
            {service.stages.map((stage, index) => (
              <li key={stage.title} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm text-primary">0{index + 1}</p>
                <h3 className="font-semibold">{stage.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.text}</p>
              </li>
            ))}
          </ol>
          <h2 className="mt-10 text-2xl font-semibold">Оборудование и узлы</h2>
          <ul className="mt-4 space-y-3">
            {service.equipment.map((item) => (
              <li key={item.name}><span className="font-medium">{item.name}. </span><span className="text-muted-foreground">{item.note}</span></li>
            ))}
          </ul>
          <Section title="Как проверить результат" items={service.checks} />
          <Section title="Безопасность" items={service.safety} />
          <Section title="Ограничения" items={service.limitations} />
          <p className="mt-6 text-sm leading-6 text-muted-foreground">{service.timelineNote}</p>
          <h2 className="mt-10 text-2xl font-semibold">Вопросы</h2>
          <Accordion type="single" collapsible className="mt-4">
            {service.faq.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-[132px] lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">Запросить расчёт</h2>
            <div className="mt-4">
              <PreviewForm subject={service.name} compact />
            </div>
          </div>
          <FavoriteButton id={service.id} label={service.name} />
          <div>
            <h2 className="font-semibold">Смежные работы</h2>
            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link className="text-sm text-primary" href={`/services/${item.categoryId}/${item.slug}`}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6">{items.map((item) => <li key={item}>— {item}</li>)}</ul>
    </section>
  );
}
