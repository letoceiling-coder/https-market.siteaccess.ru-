"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";

// A tiny external store so both <Link> clicks and programmatic router.push
// (search/filter forms) can light up one shared top progress bar.
const listeners = new Set<() => void>();
let pending = false;

function emit() {
  listeners.forEach((listener) => listener());
}

export function startNav() {
  if (pending) return;
  pending = true;
  emit();
}

function endNav() {
  if (!pending) return;
  pending = false;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // A stable string key: useSearchParams() returns a fresh object each render,
  // so depending on it directly would fire effects on every render.
  const routeKey = pathname + (searchParams.toString() ? `?${searchParams}` : "");
  const active = useSyncExternalStore(
    subscribe,
    () => pending,
    () => false,
  );

  // Start the bar when an internal link is clicked (covers every <Link>).
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (href === routeKey) return;
      startNav();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [routeKey]);

  // The route committed (path or query changed): finish the bar.
  useEffect(() => {
    endNav();
  }, [routeKey]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent" role="presentation" aria-hidden="true">
      <div className="nav-progress h-full bg-primary" />
    </div>
  );
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
