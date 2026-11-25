import type { Metadata } from "next";
import { Photo, PhotoCredit } from "@/components/site/photo";
import { getMedia } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Портфолио",
  description: "Визуальные ориентиры. Это не выполненные объекты HELP HOMES.",
};

const references = ["house-wood", "house-brick", "house-lawn", "kitchen", "bathroom", "construction"];

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4 pb-10">
      <h1 className="text-2xl font-bold">Визуальные ориентиры</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        Портфолио выполненных работ пусто. Ниже — лицензированные фотографии как образ языка будущих карточек. Они не являются объектами платформы.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {references.map((id) => {
          const media = getMedia(id);
          return (
            <li key={id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[4/3]"><Photo media={media} /></div>
              <div className="space-y-2 p-4">
                <p className="font-medium">{media.alt}</p>
                <PhotoCredit media={media} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
