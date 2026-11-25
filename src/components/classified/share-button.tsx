"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <button type="button" onClick={share} className="grid h-12 w-12 place-items-center rounded-xl bg-[#f2f1f0]" aria-label="Поделиться">
      <Share2 className="size-5" aria-hidden="true" />
    </button>
  );
}
