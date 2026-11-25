import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Правила рекламы" };

export default function AdvertisingRulesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Правила рекламы</h1>
      <p className="mt-4 leading-7">Рекламный блок помечается словом «Реклама» и не смешивается со справочными карточками. Он не может обещать цену, которой нет в утверждённом прайсе.</p>
      <p className="mt-4 leading-7">Тарифы не опубликованы. Предпросмотр форматов не является медиакитом с ценами.</p>
      <p className="mt-4"><Link href="/advertising" className="text-primary">Открыть предпросмотр размещений</Link></p>
    </article>
  );
}
