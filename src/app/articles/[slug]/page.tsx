import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Crumbs } from "@/components/site/crumbs";
import { Photo, PhotoCredit } from "@/components/site/photo";
import { OriginNote, PageSkeleton } from "@/components/site/states";
import { getArticle, getArticles, getMedia, getServiceById } from "@/services/catalog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getArticles().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return { title: "Статья не найдена" };
  return { title: article.title, description: article.summary };
}

export default function ArticlePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ArticleScreen params={params} />
    </Suspense>
  );
}

async function ArticleScreen({ params }: { params: Params }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const media = getMedia(article.imageId);
  const related = article.relatedServiceIds.map(getServiceById).filter((item) => item !== null);
  return (
    <article className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <Crumbs items={[{ href: "/", label: "Главная" }, { href: "/articles", label: "Знания" }, { label: article.title }]} />
      <h1 className="mt-6 text-2xl font-bold">{article.title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">{article.summary}</p>
      <div className="mt-4"><OriginNote text={`${article.origin.note} Проверка специалиста ещё не проводилась.`} /></div>
      <figure className="mt-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl"><Photo media={media} priority /></div>
        <figcaption className="mt-2"><PhotoCredit media={media} /></figcaption>
      </figure>
      {article.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-2xl font-semibold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-7">{paragraph}</p>
          ))}
        </section>
      ))}
      <h2 className="mt-10 text-2xl font-semibold">Связанные работы</h2>
      <ul className="mt-3 space-y-2">
        {related.map((service) => (
          <li key={service.id}>
            <Link className="text-primary" href={`/services/${service.categoryId}/${service.slug}`}>{service.name}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
