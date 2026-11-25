"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "cn";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  /** Present for a video slide; `src` is then the poster frame. */
  video?: string;
}

/** Gallery on native scroll-snap: swipe uses the browser's own touch physics. Phones get it edge to edge. */
export function PhotoSwipe({ items }: { items: GalleryItem[] }) {
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
        className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto rounded-3xl bg-tile max-lg:-mx-4 max-lg:aspect-[4/4.2] max-lg:rounded-none sm:max-lg:aspect-[16/10]"
        onScroll={(event) => {
          const element = event.currentTarget;
          setIndex(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)));
        }}
        role="group"
        aria-roledescription="карусель"
        aria-label="Фото и видео"
      >
        {items.map((media, position) => (
          <div key={media.id} className="relative h-full w-full shrink-0 snap-center" aria-label={`${media.video ? "Видео" : "Фото"} ${position + 1} из ${items.length}`}>
            {media.video ? (
              <VideoSlide src={media.video} poster={media.src} label={media.alt} />
            ) : (
              <Image src={media.src} alt={media.alt} fill priority={position === 0} sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            )}
          </div>
        ))}
      </div>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow disabled:opacity-0 lg:grid"
            aria-label="Предыдущее"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow disabled:opacity-0 lg:grid"
            aria-label="Следующее"
            disabled={index === items.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1 max-lg:bottom-9" aria-hidden="true">
            {items.map((media, position) => (
              <span key={media.id} className={cn("h-1.5 rounded-full bg-white/60 transition-all", position === index ? "w-4 bg-white" : "w-1.5")} />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {index + 1} из {items.length}
          </p>
        </>
      ) : null}
    </div>
  );
}

function VideoSlide({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className="absolute inset-0 size-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className="press absolute top-3 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-3 text-[12px] font-semibold text-white backdrop-blur-sm max-lg:top-auto max-lg:bottom-14 lg:top-auto lg:bottom-10"
        aria-label={playing ? "Пауза" : "Смотреть видео"}
      >
        {playing ? <Pause className="size-3.5 fill-white" aria-hidden="true" /> : <Play className="size-3.5 fill-white" aria-hidden="true" />}
        Видео
      </button>
    </>
  );
}
