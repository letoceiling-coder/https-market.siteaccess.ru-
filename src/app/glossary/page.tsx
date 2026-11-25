import type { Metadata } from "next";
import Link from "next/link";
import { getGlossary, getServiceById } from "@/services/catalog";

export const metadata: Metadata = { title: "Словарь", description: "Короткие определения инженерных терминов." };

export default function GlossaryPage() {
  const entries = getGlossary();
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Словарь</h1>
      <nav aria-label="Термины" className="mt-6 flex flex-wrap gap-2">
        {entries.map((item) => (
          <a key={item.id} href={`#${item.slug}`} className="rounded-full border border-border px-3 py-1 text-sm">{item.term}</a>
        ))}
      </nav>
      <dl className="mt-8 space-y-8">
        {entries.map((item) => (
          <div key={item.id} id={item.slug} className="scroll-mt-24">
            <dt className="text-2xl font-semibold">{item.term}</dt>
            <dd className="mt-2 leading-7">{item.definition}</dd>
            <dd className="mt-2 text-sm">
              {item.relatedServiceIds.map(getServiceById).filter((service) => service !== null).map((service) => (
                <Link key={service.id} href={`/services/${service.categoryId}/${service.slug}`} className="mr-4 text-primary">{service.name}</Link>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
