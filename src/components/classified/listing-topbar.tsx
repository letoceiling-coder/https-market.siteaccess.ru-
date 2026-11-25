"use client";

import { ChevronLeft, Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStoredIds } from "@/hooks/storage";
import { cn } from "cn";

const round = "press grid size-10 place-items-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur";

/** Phone-only bar floating over the gallery: back, share, save. Replaces the site header on the listing screen. */
export function ListingTopbar({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const favorites = useStoredIds("hh.favorites");
  const saved = favorites.has(id);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // cancelled by the person
      }
    }
    await navigator.clipboard?.writeText(url);
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
      <button
        type="button"
        className={cn(round, "pointer-events-auto")}
        aria-label="Назад"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      >
        <ChevronLeft className="size-[22px]" aria-hidden="true" />
      </button>
      <div className="pointer-events-auto flex gap-2">
        <button type="button" className={round} aria-label="Поделиться" onClick={share}>
          <Share2 className="size-[18px]" aria-hidden="true" />
        </button>
        <button type="button" className={round} aria-pressed={saved} aria-label={saved ? "Убрать из избранного" : "В избранное"} onClick={() => favorites.toggle(id)}>
          <Heart className={cn("size-[18px]", saved && "fill-primary text-primary")} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
