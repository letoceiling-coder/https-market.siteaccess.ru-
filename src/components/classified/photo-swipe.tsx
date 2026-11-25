"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { MediaAsset } from "@/domain/types";
import { cn } from "cn";

/** Gallery on native scroll-snap: swipe works with the browser's own touch physics. */
export function PhotoSwipe({ items }: { items: MediaAsset[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;

  function goTo(next: number) {
    const element = track.current;
    if (!element) return;
    const clamped = Math.min(items.length - 1, Math.max(0, next));
    element.scrollTo({ left: clamped * element.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="group/gallery relative">
      <div
        ref={track}
        className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto rounded-2xl bg-[#f2f1f0] [scrollbar-width:none] max-sm:-mx-4 max-sm:aspect-[4/3] max-sm:rounded-none [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const element = event.currentTarget;
          setIndex(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)));
        }}
        role="group"
        aria-roledescription="карусель"
        aria-label="Фотографии"
      >
        {items.map((media, position) => (
          <div key={media.id} className="relative h-full w-full shrink-0 snap-center" aria-label={`Фото ${position + 1} из ${items.length}`}>
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority={position === 0}
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow disabled:opacity-0 sm:grid"
            aria-label="Предыдущее фото"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow disabled:opacity-0 sm:grid"
            aria-label="Следующее фото"
            disabled={index === items.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <p className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white max-sm:right-3" aria-live="polite">
            {index + 1} / {items.length}
          </p>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
            {items.map((media, position) => (
              <span key={media.id} className={cn("size-1.5 rounded-full bg-white/60", position === index && "bg-white")} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
