import type { Metadata } from "next";
import Link from "next/link";
import { ListingGrid, ServiceCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { getConstruction, getServiceById, getServices } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Строительство",
  description: "Справочные технологии и составы комплектаций без цен.",
};

export default function ConstructionPage() {
  const { technologies, packages } = getConstruction();
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Строительство дома</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        Сравнение технологий и состав будущей комплектации. Денежных оценок нет: прайс не утверждён, а тексты ждут проверки специалиста.
      </p>
      <h2 className="mt-8 text-lg font-bold">Работы</h2>
      <div className="mt-3">
        <ListingGrid columns="catalog">
          {getServices("stroitelstvo").map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ListingGrid>
      </div>
      <h2 className="mt-10 text-lg font-bold">Технологии</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {technologies.map((item) => {
          const service = getServiceById(item.serviceId);
          return (
            <Reveal key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-2xl font-semibold">{item.name}</h2>
              <p className="mt-3 leading-7">{item.summary}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.suitableFor}</p>
              <ul className="mt-4 space-y-2 text-sm">{item.watchouts.map((note) => <li key={note}>— {note}</li>)}</ul>
              {service ? (
                <Link className="mt-4 inline-block text-sm text-primary" href={`/services/${service.categoryId}/${service.slug}`}>
                  Открыть работу «{service.name}»
                </Link>
              ) : null}
            </Reveal>
          );
        })}
      </div>
      <h2 className="mt-12 text-3xl font-semibold">Состав комплектации</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {packages.map((item) => (
          <article key={item.id} className="rounded-2xl bg-secondary p-5">
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <p className="mt-2 text-sm leading-6">{item.summary}</p>
            <h4 className="mt-4 text-sm font-semibold">Входит</h4>
            <ul className="mt-2 space-y-1 text-sm">{item.includes.map((line) => <li key={line}>{line}</li>)}</ul>
            <h4 className="mt-4 text-sm font-semibold">Не входит</h4>
            <ul className="mt-2 space-y-1 text-sm">{item.excludes.map((line) => <li key={line}>{line}</li>)}</ul>
            <p className="mt-4 text-sm font-medium">Цена не публикуется</p>
          </article>
        ))}
      </div>
      <p className="mt-8">
        <Link href="/calculators/dom" className="rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground">Собрать запрос без сметы</Link>
      </p>
    </div>
  );
}
