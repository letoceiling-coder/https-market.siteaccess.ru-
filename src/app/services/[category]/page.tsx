import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ServiceCard } from "@/components/site/cards";
import { Crumbs } from "@/components/site/crumbs";
import { OriginNote, PageSkeleton } from "@/components/site/states";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { normalize } from "@/domain/text";
import { getCategories, getCategory, getServices } from "@/services/catalog";

type Params = Promise<{ category: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export function generateStaticParams() {
  return getCategories().map((item) => ({ category: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Направление не найдено" };
  return { title: category.name, description: category.summary };
}

export default function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryScreen params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryScreen({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { category: slug } = await params;
  const query = await searchParams;
  const category = getCategory(slug);
  if (!category) notFound();
  const raw = Array.isArray(query.q) ? query.q[0] ?? "" : query.q ?? "";
  const needle = normalize(raw);
  const services = getServices(category.id).filter((item) =>
    needle ? normalize(`${item.name} ${item.summary}`).includes(needle) : true,
  );

  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <Crumbs items={[{ href: "/", label: "Главная" }, { href: "/services", label: "Услуги" }, { label: category.name }]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{category.description}</p>
          <div className="mt-4"><OriginNote text={category.origin.note} /></div>
        </div>
        <aside className="rounded-2xl bg-secondary p-5">
          <h2 className="font-semibold">Кому подходит</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">{category.audience.map((item) => <li key={item}>{item}</li>)}</ul>
        </aside>
      </div>
      <form action={`/services/${category.slug}`} className="mt-8 flex flex-col gap-3 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="service-q">Фильтр работ</label>
        <input id="service-q" name="q" defaultValue={raw} placeholder="Найти работу внутри направления" className="h-11 flex-1 rounded-lg border border-input bg-card px-3" />
        <button className="h-11 rounded-lg bg-primary px-5 text-primary-foreground" type="submit">Найти</button>
      </form>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {services.map((service) => <ServiceCard key={service.id} service={service} />)}
      </div>
      {services.length === 0 ? <p className="mt-6 text-muted-foreground">В этом направлении нет работы с таким запросом.</p> : null}
      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Технология</h2>
          <p className="mt-3 leading-7">{category.technology}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6">{category.advantages.map((item) => <li key={item}>— {item}</li>)}</ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Ограничения</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6">{category.limitations.map((item) => <li key={item}>— {item}</li>)}</ul>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Вопросы</h2>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="price">
            <AccordionTrigger>Почему нет цены?</AccordionTrigger>
            <AccordionContent>Прайс не утверждён. Стоимость считается после обследования и не публикуется заранее.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="review">
            <AccordionTrigger>Можно ли опираться на текст как на проект?</AccordionTrigger>
            <AccordionContent>Нет. Это справочник со статусом «нужна проверка специалиста».</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
