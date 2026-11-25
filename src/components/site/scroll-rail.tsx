"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useDragScroll } from "@/hooks/drag-scroll";
import { cn } from "cn";

/**
 * Horizontal row without a visible scrollbar.
 * Touch: native swipe. Mouse: drag, vertical wheel, and round arrow buttons that appear only while there is more to see.
 * Edges fade out to hint that the row continues.
 */
export function ScrollRail({
  children,
  label,
  className,
  trackClassName,
  arrows = true,
}: {
  children: ReactNode;
  label?: string;
  /** Wrapper (outer box) classes, e.g. negative margins for a full-bleed row on phones. */
  className?: string;
  /** Track classes: gap, padding, snap. The track is the flex row itself. */
  trackClassName?: string;
  arrows?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  useDragScroll(track);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => observer.disconnect();
  }, [measure]);

  function page(direction: 1 | -1) {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const mask =
    edges.start && edges.end
      ? "linear-gradient(to right, transparent, #000 32px, #000 calc(100% - 32px), transparent)"
      : edges.start
        ? "linear-gradient(to right, transparent, #000 32px)"
        : edges.end
          ? "linear-gradient(to right, #000 calc(100% - 32px), transparent)"
          : undefined;

  return (
    <div className={cn("group/rail relative min-w-0", className)}>
      <div
        ref={track}
        role={label ? "group" : undefined}
        aria-label={label}
        onScroll={measure}
        className={cn("no-scrollbar flex overflow-x-auto overscroll-x-contain [&_a]:[-webkit-user-drag:none] [&_img]:pointer-events-none", trackClassName)}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {children}
      </div>
      {arrows ? (
        <>
          <RailArrow side="left" visible={edges.start} onClick={() => page(-1)} />
          <RailArrow side="right" visible={edges.end} onClick={() => page(1)} />
        </>
      ) : null}
    </div>
  );
}

function RailArrow({ side, visible, onClick }: { side: "left" | "right"; visible: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-float transition-opacity hover:text-primary [@media(pointer:fine)]:grid",
        side === "left" ? "-left-2" : "-right-2",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-[18px]" />
    </button>
  );
}
