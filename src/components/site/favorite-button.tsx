"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoredIds } from "@/hooks/storage";
import { cn } from "cn";

export function FavoriteButton({
  id,
  label,
  compact = false,
  className,
}: {
  id: string;
  label: string;
  compact?: boolean;
  className?: string;
}) {
  const favorites = useStoredIds("hh.favorites");
  const active = favorites.has(id);
  if (compact) {
    return (
      <button
        type="button"
        aria-pressed={active}
        aria-label={active ? `Убрать из избранного: ${label}` : `В избранное: ${label}`}
        className="grid size-8 place-items-center rounded-full bg-white/95 text-foreground shadow-sm transition hover:scale-105"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          favorites.toggle(id);
        }}
      >
        <Heart className={active ? "size-4 fill-primary text-primary" : "size-4"} aria-hidden="true" />
      </button>
    );
  }
  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("h-10 px-3", className)}
      aria-pressed={active}
      onClick={() => favorites.toggle(id)}
    >
      <Heart className={active ? "fill-primary text-primary" : ""} aria-hidden="true" />
      {active ? "В избранном" : "В избранное"}
      <span className="sr-only">: {label}</span>
    </Button>
  );
}
