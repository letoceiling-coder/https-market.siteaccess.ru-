import { ArrowRight, LayoutGrid, Map } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMedia } from "@/services/catalog";
import { ScrollRail } from "@/components/site/scroll-rail";

/**
 * Category mosaic.
 * Desktop: expressive horizontal tiles (text left, photo right) + business aside.
 * Mobile: compact 2-row carousel (~136×64) with a visible peek of the next column
 * and an explicit «Все категории» tile. Titles never hyphenate mid-word.
 */
const tiles = [
  { href: "/catalog/transport/legkovye", title: "Авто", imageId: "d-car-red" },
  { href: "/catalog/nedvizhimost/kvartiry", title: "Недвижимость", imageId: "d-flat-living" },
  { href: "/catalog/nedvizhimost/kvartiry?deal=rent", title: "Аренда", imageId: "d-beach-house" },
  { href: "/catalog/rabota", title: "Работа", imageId: "d-job-meeting" },
  { href: "/catalog/uslugi", title: "Услуги", imageId: "d-repair" },
  { href: "/catalog/elektronika", title: "Электроника", imageId: "d-headphones" },
  { href: "/catalog/odezhda", title: "Одежда", imageId: "d-shoes-red" },
  { href: "/catalog/dom-i-dacha", title: "Дом и дача", imageId: "d-sofa-blue" },
  { href: "/catalog/transport/zapchasti", title: "Запчасти", imageId: "tile-parts" },
  { href: "/catalog/zhivotnye", title: "Животные", imageId: "d-cat" },
  { href: "/catalog/deti", title: "Детские товары", imageId: "d-kids-toys" },
  { href: "/catalog/hobbi", title: "Спорт", imageId: "d-guitar" },
  { href: "/catalog/biznes", title: "Бизнес", imageId: "d-job-handshake" },
  { href: "/catalog/uslugi/stroitelstvo", title: "Строительство", imageId: "d-crane-crop" },
];

const business = [
  ["Вакансии и резюме", "/catalog/rabota"],
  ["Коммерческая недвижимость", "/catalog/nedvizhimost/kommercheskaya"],
  ["Оборудование и техника", "/catalog/uslugi/stroitelstvo"],
  ["Готовый бизнес", "/catalog/biznes"],
  ["Реклама и продвижение", "/advertising"],
] as const;

export function CategoryMosaic() {
  const handshake = getMedia("d-job-handshake");
  return (
    <section aria-label="Категории">
      <MobileRail />
      <div className="relative hidden lg:block">
        <div className="grid snap-x snap-mandatory auto-cols-[minmax(136px,42vw)] grid-flow-col grid-rows-2 gap-2 px-3 pb-2 sm:auto-cols-[148px] sm:px-4 lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-4 lg:grid-rows-none lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-[repeat(4,minmax(0,1fr))_332px]">
          {tiles.map((tile, position) => {
            const media = getMedia(tile.imageId);
            return (
              <Link
                key={`${tile.href}-${tile.title}`}
                href={tile.href}
                className="group relative flex h-16 snap-start overflow-hidden rounded-xl bg-card shadow-[0_1px_0_var(--border)] sm:h-[68px] lg:h-[102px] lg:rounded-3xl"
              >
                <span className="relative z-10 flex w-[72%] items-center py-2 pr-1 pl-2.5 text-[12px] leading-[15px] font-bold hyphens-none text-foreground sm:pl-3 sm:text-[13px] sm:leading-4 lg:w-[56%] lg:items-start lg:py-3.5 lg:pr-2 lg:pl-5 lg:text-[15px] lg:leading-[21px] lg:font-medium">
                  <span className="line-clamp-2">{tile.title}</span>
                </span>
                <span className="absolute inset-y-0 right-0 w-[28%] overflow-hidden lg:w-[44%]">
                  <Image
                    src={media.src}
                    alt=""
                    fill
                    priority={position < 4}
                    sizes="(min-width: 1280px) 130px, 80px"
                    className="object-cover transition duration-200 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </span>
              </Link>
            );
          })}
          <Link
            href="/catalog"
            className="group relative flex h-16 snap-start items-center gap-2 overflow-hidden rounded-xl bg-accent px-3 text-[12px] leading-[15px] font-bold text-primary sm:h-[68px] sm:text-[13px] lg:col-span-4 lg:h-[102px] lg:rounded-3xl lg:px-5 lg:text-[15px] xl:col-span-1 xl:col-start-5 xl:row-start-4 xl:mt-1.5 xl:hidden"
          >
            <LayoutGrid className="size-4 shrink-0" aria-hidden="true" />
            Все категории
          </Link>
          <aside className="hidden flex-col gap-2 rounded-3xl bg-card p-5 shadow-[0_1px_0_var(--border)] lg:col-span-4 lg:flex lg:flex-row lg:items-center lg:gap-6 xl:col-span-1 xl:ml-8 xl:col-start-5 xl:row-span-3 xl:row-start-1 xl:h-0 xl:min-h-full xl:flex-col xl:items-stretch xl:gap-0 xl:overflow-hidden">
            <div className="shrink-0">
              <h2 className="text-[20px] leading-6 font-bold">Для бизнеса</h2>
              <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground xl:hidden">Размещения и инструменты для компаний</p>
            </div>
            <ul className="grid flex-1 grid-cols-3 gap-x-6 gap-y-1 text-[14px] leading-5 xl:mt-2 xl:grid-cols-1 xl:gap-y-1">
              {business.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center justify-between gap-2 hover:text-primary">
                    {label}
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground xl:hidden" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/account/partner/listings/new"
              className="relative mt-2 hidden min-h-[72px] flex-1 overflow-hidden rounded-xl xl:block"
              aria-label="Разместить объявление для бизнеса"
            >
              <Image src={handshake.src} alt="" fill sizes="260px" className="object-cover" />
              <span className="absolute right-2 bottom-2 left-2 grid h-9 place-content-center rounded-lg bg-primary text-[14px] font-semibold text-white">
                Разместить
              </span>
            </Link>
          </aside>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent lg:hidden"
        />
      </div>
    </section>
  );
}

/** Phones: one swipeable row of photo tiles, like an app's category strip. */
function MobileRail() {
  return (
    <nav aria-label="Категории" className="-mx-3 sm:-mx-4 lg:hidden">
      <ScrollRail trackClassName="snap-x gap-3 px-4 pt-1 pb-1">
        <div className="shrink-0 snap-start">
          <Link href="/map" className="press flex w-[68px] flex-col items-center gap-1.5 text-center">
            <span className="grid size-[64px] place-items-center rounded-[22px] bg-primary text-white">
              <Map className="size-6" aria-hidden="true" />
            </span>
            <span className="text-[11.5px] leading-[14px] font-medium">На карте</span>
          </Link>
        </div>
        {tiles.map((tile) => {
          const media = getMedia(tile.imageId);
          return (
            <div key={`${tile.href}-${tile.title}`} className="shrink-0 snap-start">
              <Link href={tile.href} className="press flex w-[68px] flex-col items-center gap-1.5 text-center">
                <span className="relative size-[64px] overflow-hidden rounded-[22px] bg-tile">
                  <Image src={media.src} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="line-clamp-2 text-[11.5px] leading-[14px] font-medium hyphens-none">{tile.title}</span>
              </Link>
            </div>
          );
        })}
        <div className="shrink-0 snap-start">
          <Link href="/catalog" className="press flex w-[68px] flex-col items-center gap-1.5 text-center">
            <span className="grid size-[64px] place-items-center rounded-[22px] bg-accent text-primary">
              <LayoutGrid className="size-6" aria-hidden="true" />
            </span>
            <span className="text-[11.5px] leading-[14px] font-medium">Все</span>
          </Link>
        </div>
      </ScrollRail>
    </nav>
  );
}
