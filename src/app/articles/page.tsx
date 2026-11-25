import type { Metadata } from "next";
import Link from "next/link";
import { OriginNote } from "@/components/site/states";
import { getArticles } from "@/services/catalog";

export const metadata: Metadata = {
  title: "База знаний",
  description: "Черновики статей. Тексты ещё не проверены специалистом.",
};

export default function ArticlesPage() {
  const articles = getArticles();
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">База знаний</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        Материалы собраны как редакционные черновики. Даты проверки нет, поэтому на них нельзя опираться как на проектное решение.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <li key={article.id} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">
              <Link href={`/articles/${article.slug}`} className="hover:text-primary">{article.title}</Link>
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.summary}</p>
            <div className="mt-3"><OriginNote text={article.origin.note} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
