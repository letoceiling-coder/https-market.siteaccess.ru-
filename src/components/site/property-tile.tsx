import Link from "next/link";
import { FavoriteButton } from "@/components/site/favorite-button";
import { Photo } from "@/components/site/photo";
import type { MediaAsset } from "@/domain/types";

export type PropertyView = {
  id: string;
  slug: string;
  title: string;
  facts: string;
  region: string;
  regionId: string;
  image: MediaAsset;
};

export function PropertyTile({ item }: { item: PropertyView }) {
  return (
    <article className="group relative min-w-0">
      <Link href={`/properties/${item.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <Photo media={item.image} className="transition duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1280px) 18vw, 50vw" />
        </div>
        <p className="mt-2 text-[16px] font-bold leading-5">Цена не указана</p>
        <h3 className="mt-1 line-clamp-2 text-sm leading-5">{item.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{item.facts}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.region} · образец, не продаётся</p>
      </Link>
      <div className="absolute top-2 right-2">
        <FavoriteButton id={item.id} label={item.title} compact />
      </div>
    </article>
  );
}
