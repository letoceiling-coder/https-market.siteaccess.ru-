import Link from "next/link";
import { ListingImage } from "@/components/classified/listing-image";
import type { MapPoint } from "@/services/map-data";

export function MapListingPreview({ point, onClose }: { point: MapPoint; onClose: () => void }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-white p-2 shadow-lg">
      <span className="relative block size-[72px] shrink-0 overflow-hidden rounded-lg bg-tile">
        {point.media ? <ListingImage src={point.media.src} alt={point.media.alt} sizes="72px" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold tracking-wide text-muted-foreground">DEMO</p>
        <p className="line-clamp-2 text-[14px] leading-[18px]">{point.title}</p>
        <p className="mt-0.5 text-[15px] font-bold">{point.priceShort}</p>
        <p className="truncate text-[12px] text-muted-foreground">{point.place}</p>
      </div>
      <div className="flex flex-col justify-between">
        <button type="button" onClick={onClose} className="h-8 rounded-lg px-2 text-[12px] text-muted-foreground">
          Закрыть
        </button>
        <Link href={`/samples/${point.slug}`} className="rounded-lg bg-primary px-3 py-2 text-[12px] font-semibold text-white">
          Открыть
        </Link>
      </div>
    </div>
  );
}
