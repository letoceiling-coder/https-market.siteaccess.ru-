import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1348px] grid-cols-2 gap-3 px-3 py-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Catalog/search skeleton: sidebar + card grid, matching the real layout to avoid shift. */
export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-3 h-7 w-56" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Listing/detail skeleton: gallery + info column. */
export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1348px] px-4 py-4">
      <Skeleton className="h-4 w-56" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{text}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Не удалось показать данные", text }: { title?: string; text: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-card px-6 py-10" role="alert">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export function OriginNote({ text }: { text: string }) {
  return <p className="rounded-xl bg-secondary px-4 py-3 text-sm leading-6 text-secondary-foreground">{text}</p>;
}
