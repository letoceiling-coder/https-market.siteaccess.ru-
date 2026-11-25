"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

type Crumb = { href?: string; label: string };

function subscribeDesktop(onStoreChange: () => void) {
  const media = window.matchMedia("(min-width: 640px)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function desktopSnapshot() {
  return window.matchMedia("(min-width: 640px)").matches;
}

/**
 * Responsive breadcrumbs.
 * - Desktop (sm+): the full, clickable chain.
 * - Mobile (<sm): a single line — a back link to the nearest parent plus the current
 *   segment, truncated. Never wraps to a second row (height stays ~36px).
 */
export function Crumbs({ items }: { items: Crumb[] }) {
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, () => false);
  const current = items[items.length - 1];
  const parent = [...items].slice(0, -1).reverse().find((item) => item.href);

  if (!desktop) {
    return (
      <nav aria-label="Навигационная цепочка" className="text-sm text-muted-foreground">
        <div className="flex h-9 items-center gap-1">
          {parent?.href ? (
            <>
              <Link href={parent.href} className="flex shrink-0 items-center gap-0.5 font-medium text-foreground">
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="max-w-[40vw] truncate">{parent.label}</span>
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span aria-current="page" className="truncate">
            {current?.label}
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label="Навигационная цепочка" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined} className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
