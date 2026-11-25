import type { Metadata } from "next";
import Link from "next/link";
import { getCalculators } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Калькуляторы",
  description: "Предварительные прикидки без коммерческого предложения.",
};

export default function CalculatorsPage() {
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Калькуляторы</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        Четыре наброска для разговора со специалистом. Они не подбирают оборудование и не называют цену.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {getCalculators().map((item) => (
          <li key={item.slug} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">
              <Link href={`/calculators/${item.slug}`} className="hover:text-primary">{item.name}</Link>
            </h2>
            <p className="mt-2 text-sm leading-6">{item.summary}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.disclaimer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
