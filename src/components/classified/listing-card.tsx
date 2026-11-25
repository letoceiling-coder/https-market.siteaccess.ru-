import Link from "next/link";
import { ListingImage } from "@/components/classified/listing-image";
import { FavoriteButton } from "@/components/site/favorite-button";
import type { ListingCardData } from "@/domain/card";
import { cn } from "cn";

/**
 * One card for every listing type. Public data and DEMO data render through the same markup.
 * Feed stays a uniform 2-column grid on mobile: square photo, title up to 2 lines, bold price.
 * `row` still forces a horizontal list layout for dedicated list screens.
 */
export function ListingCard({ item }: { item: ListingCardData }) {
  const list = Boolean(item.row);

  return (
    <article className={cn("group relative min-w-0", list && "col-span-full")}>
      <Link
        href={item.href}
        prefetch={false}
        className={cn("block min-w-0", list && "grid grid-cols-[112px_minmax(0,1fr)] gap-3 sm:grid-cols-[240px_minmax(0,1fr)] sm:gap-4")}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f2f1f0]">
          {item.media ? (
            <ListingImage src={item.media.src} alt={item.media.alt} sizes="(min-width: 1280px) 250px, (min-width: 768px) 30vw, 50vw" />
          ) : null}
          {item.badge ? (
            <span className="absolute top-2 left-2 rounded-md bg-[#222]/80 px-1.5 py-0.5 text-[10px] leading-3 font-semibold tracking-wide text-white">
              {item.badge}
            </span>
          ) : null}
        </div>
        <div className={cn("min-w-0", list ? "pr-8 sm:pt-1" : "pt-[7px]")}>
          <h3 className={cn("text-[14px] leading-[18px] text-[#222] hyphens-none group-hover:text-primary sm:text-[15px] sm:leading-5", list ? "line-clamp-2" : "line-clamp-2")}>
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-[16px] leading-5 font-bold text-[#222]">{item.price}</p>
          {item.facts ? <p className="mt-1 truncate text-[12px] leading-[16px] text-[#767676] sm:text-[13px] sm:leading-[18px]">{item.facts}</p> : null}
          {item.place ? <p className="truncate text-[12px] leading-[16px] text-[#767676] sm:text-[13px] sm:leading-[18px]">{item.place}</p> : null}
          {item.date ? <p className="text-[11px] leading-[16px] text-[#a0a0a0] sm:text-[12px] sm:leading-[18px]">{item.date}</p> : null}
        </div>
      </Link>
      <div className={cn("absolute top-2 right-2", list && "sm:top-1 sm:right-0")}>
        <FavoriteButton id={item.id} label={item.title} compact />
      </div>
    </article>
  );
}
