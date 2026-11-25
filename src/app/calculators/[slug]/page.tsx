import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalculatorForm } from "@/components/calculators/calculator-form";
import { Crumbs } from "@/components/site/crumbs";
import { PageSkeleton } from "@/components/site/states";
import { getCalculator, getCalculators } from "@/services/catalog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getCalculators().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const item = getCalculator((await params).slug);
  if (!item) return { title: "Калькулятор не найден" };
  return { title: item.name, description: item.summary };
}

export default function CalculatorPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CalculatorScreen params={params} />
    </Suspense>
  );
}

async function CalculatorScreen({ params }: { params: Params }) {
  const item = getCalculator((await params).slug);
  if (!item) notFound();
  return (
    <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-4 pb-10 lg:grid-cols-[1fr_320px]">
      <div>
        <Crumbs items={[{ href: "/", label: "Главная" }, { href: "/calculators", label: "Калькуляторы" }, { label: item.name }]} />
        <h1 className="mt-6 text-2xl font-bold">{item.name}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{item.summary}</p>
        <div className="mt-6"><CalculatorForm slug={item.slug} disclaimer={item.disclaimer} /></div>
      </div>
      <aside className="rounded-2xl bg-secondary p-5 text-sm leading-6">
        <h2 className="font-semibold">Как пользоваться</h2>
        <p className="mt-3">Числа остаются в допустимых пределах. Выход за них показывает ошибку, а не «примерно ноль».</p>
        <p className="mt-3">Если нужна работа, а не прикидка, откройте соответствующее направление каталога.</p>
        <Link className="mt-4 inline-block text-primary" href="/services">Каталог услуг</Link>
      </aside>
    </div>
  );
}
