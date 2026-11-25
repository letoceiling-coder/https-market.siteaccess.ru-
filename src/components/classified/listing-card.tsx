import { Camera, Play } from "lucide-react";
import Link from "next/link";
import { ListingImage } from "@/components/classified/listing-image";
import { FavoriteButton } from "@/components/site/favorite-button";
import type { ListingCardData } from "@/domain/card";
import { cn } from "cn";

/**
 * One card for every listing type. Public data and DEMO data render through the same markup.
 * Phones: uniform 2-column grid, 4:5 photo, price first (what people scan for), title up to 2 lines.
 * `row` forces a horizontal list layout for dedicated list screens.
 */
export function ListingCard({ item }: { item: ListingCardData }) {
  const list = Boolean(item.row);

  return (
    <article className={cn("group relative min-w-0", list && "col-span-full")}>
      <Link
        href={item.href}
        prefetch={false}
        className={cn("press block min-w-0 rounded-[18px] focus-visible:outline-offset-4", list && "grid grid-cols-[112px_minmax(0,1fr)] gap-3 sm:grid-cols-[240px_minmax(0,1fr)] sm:gap-4")}
      >
        <div className={cn("relative overflow-hidden rounded-[18px] bg-tile", list ? "aspect-square" : "aspect-[4/5] sm:aspect-square")}>
          {item.media ? (
            <ListingImage src={item.media.src} alt={item.media.alt} sizes="(min-width: 1280px) 250px, (min-width: 768px) 30vw, 50vw" />
          ) : null}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {item.hasVideo ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-black/55 px-2 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Play className="size-3 fill-white" aria-hidden="true" />
                Видео
              </span>
            ) : null}
            {item.mediaCount && item.mediaCount > 1 ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-black/55 px-2 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Camera className="size-3" aria-hidden="true" />
                {item.mediaCount}
                <span className="sr-only">фото</span>
              </span>
            ) : null}
          </div>
          {item.badge ? (
            <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] leading-4 font-semibold text-foreground/70 backdrop-blur-sm" title="Тестовое объявление">
              {item.badge === "DEMO" ? "тест" : item.badge}
            </span>
          ) : null}
        </div>
        <div className={cn("min-w-0", list ? "pr-8 sm:pt-1" : "px-0.5 pt-2")}>
          <p className="tabular truncate text-[17px] leading-[22px] font-bold tracking-[-0.01em] text-foreground">{item.price}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[14px] leading-[18px] text-foreground/90 hyphens-none group-hover:text-primary sm:text-[15px] sm:leading-5">
            {item.title}
          </h3>
          {item.place || item.date ? (
            <p className="mt-1 truncate text-[12px] leading-4 text-muted-foreground sm:text-[13px] sm:leading-[18px]">
              {[item.place, item.date].filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
      </Link>
      <div className={cn("absolute top-2 right-2", list && "sm:top-1 sm:right-0")}>
        <FavoriteButton id={item.id} label={item.title} compact />
      </div>
    </article>
  );
}
