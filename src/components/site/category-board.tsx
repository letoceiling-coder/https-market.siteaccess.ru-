"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/site/photo";
import type { MediaAsset } from "@/domain/types";

export type CategoryTile = {
  slug: string;
  name: string;
  media: MediaAsset;
  services: { slug: string; name: string }[];
};

export function CategoryBoard({ tiles }: { tiles: CategoryTile[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const current = tiles.find((item) => item.slug === open) ?? null;

  return (
    <section>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
        {tiles.map((tile) => (
          <button
            key={tile.slug}
            type="button"
            aria-expanded={open === tile.slug}
            className="min-w-0 rounded-xl p-1 text-left hover:bg-white"
            onClick={() => setOpen((value) => (value === tile.slug ? null : tile.slug))}
          >
            <span className="relative block aspect-square overflow-hidden rounded-xl bg-muted">
              <Photo media={tile.media} sizes="120px" />
            </span>
            <span className="mt-1 block truncate text-center text-xs leading-4">{tile.name}</span>
          </button>
        ))}
      </div>
      {current ? (
        <div className="mt-3 rounded-xl border border-border bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{current.name}</h2>
            <Link href={`/services/${current.slug}`} className="text-sm text-primary">Все работы</Link>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {current.services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${current.slug}/${service.slug}`} className="block rounded-lg px-2 py-2 text-sm hover:bg-muted">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
