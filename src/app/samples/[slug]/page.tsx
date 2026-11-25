import { Heart, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoBanner } from "@/components/classified/demo-banner";
import { DemoCard } from "@/components/classified/demo-card";
import { PhotoSwipe } from "@/components/classified/photo-swipe";
import { RecentMarker } from "@/components/catalog/recent-marker";
import { ListingGrid } from "@/components/site/cards";
import { Crumbs } from "@/components/site/crumbs";
import { FavoriteButton } from "@/components/site/favorite-button";
import { PhotoCredit } from "@/components/site/photo";
import { PageSkeleton } from "@/components/site/states";
import { formatListingPrice, formatPostedAt } from "@/domain/format";
import { getMedia, getRegion } from "@/services/catalog";
import { getDemo, getDemos, getDemoSlugs, getTaxon, getTaxonBreadcrumb } from "@/services/classified";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getDemoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const item = getDemo((await params).slug);
  if (!item) return { title: "Страница не найдена", robots: { index: false, follow: false } };
  return { title: `${item.title} (DEMO)`, description: item.originNote, robots: { index: false, follow: false } };
}

export default function SamplePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SampleScreen params={params} />
    </Suspense>
  );
}

async function SampleScreen({ params }: { params: Params }) {
  const item = getDemo((await params).slug);
  if (!item) notFound();
  const node = getTaxon(item.categoryPath);
  const region = getRegion(item.regionId);
  const gallery = (item.gallery.length > 0 ? item.gallery : [item.imageId]).map((id) => getMedia(id));
  const crumbs = node ? getTaxonBreadcrumb(node) : [];
  const similar = getDemos()
    .filter((other) => other.id !== item.id && other.categoryPath.split("/")[0] === item.categoryPath.split("/")[0])
    .slice(0, 5);
  const price = formatListingPrice(item);

  return (
    <article className="mx-auto max-w-[1348px] px-4 py-3 pb-28 lg:pb-10">
      <RecentMarker id={item.id} />
      <Crumbs items={[{ href: "/", label: "Главная" }, ...crumbs.map((crumb) => ({ href: `/catalog/${crumb.path}`, label: crumb.name }))]} />
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-[24px] leading-8 font-bold">{item.title}</h1>
      </div>
      <div className="mt-1"><DemoBanner /></div>
      <div className="mt-3 lg:hidden">
        <p className="text-[26px] leading-8 font-bold">{price}</p>
        <p className="mt-0.5 text-[13px] text-[#767676]">{item.place || region?.name} · {formatPostedAt(item.postedAt)}</p>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <PhotoSwipe items={gallery} />
          <div className="mt-2"><PhotoCredit media={gallery[0]} /></div>

          <section className="mt-6" aria-labelledby="params">
            <h2 id="params" className="text-[20px] leading-6 font-bold">Характеристики</h2>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {item.params.map(([name, value]) => (
                <div key={name} className="flex items-baseline justify-between gap-4 border-b border-[#f0f0f0] py-2 text-[14px]">
                  <dt className="text-[#767676]">{name}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6" aria-labelledby="description">
            <h2 id="description" className="text-[20px] leading-6 font-bold">Описание</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-6 whitespace-pre-line">{item.description}</p>
          </section>

          <section className="mt-6" aria-labelledby="place">
            <h2 id="place" className="text-[20px] leading-6 font-bold">Расположение</h2>
            <p className="mt-3 flex items-center gap-2 text-[15px]">
              <MapPin className="size-4 text-[#767676]" aria-hidden="true" />
              {item.place || region?.name || "Регион не указан"}
            </p>
            <Link href="/map" className="mt-2 inline-block text-sm text-primary">Открыть карту</Link>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[132px] lg:h-fit">
          <div className="rounded-2xl bg-white lg:border lg:border-[#e4e4e4] lg:p-5">
            <p className="hidden text-[28px] leading-9 font-bold lg:block">{price}</p>
            <p className="mt-1 hidden text-[13px] text-[#767676] lg:block">{item.place || region?.name} · {formatPostedAt(item.postedAt)}</p>
            <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[#ededed] bg-white p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:static lg:mt-4 lg:flex-col lg:border-0 lg:p-0 lg:pb-0">
              <Link href="/messages" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-semibold text-white lg:flex-none">
                <MessageCircle className="size-5" aria-hidden="true" />
                Написать
              </Link>
              <FavoriteButton id={item.id} label={item.title} className="h-12 rounded-xl px-4 text-[15px]" />
            </div>
            <section className="mt-5 rounded-2xl border border-[#ededed] p-4 lg:mt-4 lg:border-0 lg:bg-[#f2f1f0] lg:p-3" aria-labelledby="seller">
              <h2 id="seller" className="text-[15px] font-semibold">Продавец</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#555]">
                DEMO-карточка. Рейтинга, отзывов и подтверждённых контактов нет. Сообщения никуда не отправляются.
              </p>
            </section>
          </div>
          <p className="mt-3 hidden items-center gap-1 text-xs text-[#767676] lg:flex"><Heart className="size-3.5" aria-hidden="true" />Объявление № {item.id}</p>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-10" aria-labelledby="similar">
          <h2 id="similar" className="mb-3 text-[22px] leading-7 font-bold">Похожие объявления</h2>
          <ListingGrid>
            {similar.map((other) => <DemoCard key={other.id} item={other} />)}
          </ListingGrid>
        </section>
      ) : null}
    </article>
  );
}
