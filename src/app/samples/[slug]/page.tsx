import { CalendarDays, Hash, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoBanner } from "@/components/classified/demo-banner";
import { DemoCard } from "@/components/classified/demo-card";
import { ListingTopbar } from "@/components/classified/listing-topbar";
import { PhotoSwipe, type GalleryItem } from "@/components/classified/photo-swipe";
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
  return { title: `${item.title} (тест)`, description: item.originNote, robots: { index: false, follow: false } };
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
  const photos = (item.gallery.length > 0 ? item.gallery : [item.imageId]).map((id) => getMedia(id));
  const gallery: GalleryItem[] = [
    ...(item.video ? [{ id: `${item.id}-video`, src: item.video.poster, alt: `Видео: ${item.title}`, video: item.video.src }] : []),
    ...photos.map((media) => ({ id: media.id, src: media.src, alt: media.alt })),
  ];
  const crumbs = node ? getTaxonBreadcrumb(node) : [];
  const similar = getDemos()
    .filter((other) => other.id !== item.id && other.categoryPath.split("/")[0] === item.categoryPath.split("/")[0])
    .slice(0, 5);
  const price = formatListingPrice(item);
  const place = item.place || region?.name || "Регион не указан";
  const posted = formatPostedAt(item.postedAt);

  return (
    <article className="mx-auto max-w-[1348px] px-4 pb-32 lg:py-3 lg:pb-12">
      <RecentMarker id={item.id} />
      <div className="hidden lg:block">
        <Crumbs items={[{ href: "/", label: "Главная" }, ...crumbs.map((crumb) => ({ href: `/catalog/${crumb.path}`, label: crumb.name }))]} />
        <h1 className="mt-3 text-[28px] leading-9 font-semibold">{item.title}</h1>
        <div className="mt-2"><DemoBanner /></div>
      </div>

      <div className="mt-0 grid gap-8 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="relative">
            <ListingTopbar id={item.id} title={item.title} />
            <PhotoSwipe items={gallery} />
          </div>

          {/* Phone: content rises over the gallery like a sheet. */}
          <div className="relative z-10 -mx-4 -mt-6 rounded-t-[28px] bg-background px-4 pt-5 lg:mx-0 lg:mt-0 lg:rounded-none lg:bg-transparent lg:px-0 lg:pt-0">
            <div className="lg:hidden">
              <p className="tabular text-[28px] leading-8 font-bold tracking-[-0.02em]">{price}</p>
              <h1 className="mt-1.5 font-sans text-[18px] leading-6 font-medium tracking-normal">{item.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{place}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />{posted}</span>
              </p>
              <div className="mt-3"><DemoBanner /></div>
            </div>

            {item.facts.length > 0 ? (
              <ul className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-5 lg:flex-wrap lg:px-0" aria-label="Коротко">
                {item.facts.map((fact) => (
                  <li key={fact} className="shrink-0 rounded-2xl bg-card px-3.5 py-2 text-[14px] font-medium whitespace-nowrap shadow-[0_1px_0_var(--border)]">{fact}</li>
                ))}
              </ul>
            ) : null}

            <section className="mt-6 rounded-3xl bg-card p-4 sm:p-5" aria-labelledby="params">
              <h2 id="params" className="text-[17px] leading-6 font-semibold">Характеристики</h2>
              <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
                {item.params.map(([name, value]) => (
                  <div key={name} className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 text-[14px] last:border-0 sm:[&:nth-last-child(2)]:border-0">
                    <dt className="text-muted-foreground">{name}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-4 rounded-3xl bg-card p-4 sm:p-5" aria-labelledby="description">
              <h2 id="description" className="text-[17px] leading-6 font-semibold">Описание</h2>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.6] whitespace-pre-line">{item.description}</p>
            </section>

            <section className="mt-4 rounded-3xl bg-card p-4 sm:p-5" aria-labelledby="place">
              <h2 id="place" className="text-[17px] leading-6 font-semibold">Где находится</h2>
              <p className="mt-2 flex items-center gap-2 text-[15px]">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {place}
              </p>
              <Link href="/map" className="press mt-3 inline-flex h-10 items-center rounded-xl bg-accent px-4 text-[14px] font-semibold text-primary">Показать на карте</Link>
            </section>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <PhotoCredit media={photos[0]} />
              <span className="inline-flex items-center gap-1"><Hash className="size-3" aria-hidden="true" />{item.id}</span>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-[132px] lg:h-fit">
          <div className="hidden rounded-3xl bg-card p-5 shadow-[0_1px_0_var(--border)] lg:block">
            <p className="tabular text-[30px] leading-9 font-bold tracking-[-0.02em]">{price}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{place}, {posted}</p>
            <div className="mt-4 grid gap-2">
              <Link href="/messages" className="press flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[15px] font-semibold text-white hover:bg-primary-strong">
                <MessageCircle className="size-5" aria-hidden="true" />
                Написать продавцу
              </Link>
              <button type="button" disabled className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-[15px] font-semibold text-primary disabled:opacity-70" title="В тестовом объявлении нет телефона">
                <Phone className="size-5" aria-hidden="true" />
                Показать телефон
              </button>
              <FavoriteButton id={item.id} label={item.title} className="h-12 rounded-2xl px-4 text-[15px]" />
            </div>
          </div>
          <SellerCard />
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-10" aria-labelledby="similar">
          <h2 id="similar" className="mb-4 text-[19px] leading-6 font-semibold sm:text-[24px] sm:leading-8">Похожие объявления</h2>
          <ListingGrid>
            {similar.map((other) => <DemoCard key={other.id} item={other} />)}
          </ListingGrid>
        </section>
      ) : null}

      {/* Phone action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <button type="button" disabled className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-semibold text-primary disabled:opacity-70" title="В тестовом объявлении нет телефона">
            <Phone className="size-[18px]" aria-hidden="true" />
            Позвонить
          </button>
          <Link href="/messages" className="press flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-semibold text-white">
            <MessageCircle className="size-[18px]" aria-hidden="true" />
            Написать
          </Link>
        </div>
      </div>
    </article>
  );
}

function SellerCard() {
  return (
    <section className="mt-4 rounded-3xl bg-card p-4 shadow-[0_1px_0_var(--border)] sm:p-5" aria-labelledby="seller">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-accent font-display text-[15px] font-semibold text-primary" aria-hidden="true">Т</span>
        <div>
          <h2 id="seller" className="font-sans text-[15px] font-semibold tracking-normal">Тестовый продавец</h2>
          <p className="text-[13px] text-muted-foreground">На HELP HOMES с ноября 2026</p>
        </div>
      </div>
      <p className="mt-3 flex gap-2 rounded-2xl bg-tile p-3 text-[13px] leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Объявление создано для проверки сервиса. Сообщения никуда не отправляются, рейтинга и отзывов нет.
      </p>
    </section>
  );
}
