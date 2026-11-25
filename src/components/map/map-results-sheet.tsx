"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "cn";

export type SheetState = "collapsed" | "half" | "expanded";

export function MapResultsSheet({
  state,
  onState,
  count,
  demo = false,
  children,
}: {
  state: SheetState;
  onState: (next: SheetState) => void;
  count: number;
  demo?: boolean;
  children: ReactNode;
}) {
  const order: SheetState[] = ["collapsed", "half", "expanded"];
  const height = state === "collapsed" ? "h-24" : state === "half" ? "h-[48%]" : "h-[calc(100%-56px)]";
  const dragRef = useRef<{ startY: number; startIndex: number } | null>(null);

  function onPointerDown(event: React.PointerEvent) {
    dragRef.current = { startY: event.clientY, startIndex: order.indexOf(state) };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: React.PointerEvent) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const delta = drag.startY - event.clientY;
    let index = drag.startIndex;
    if (delta > 40) index = Math.min(2, index + 1);
    else if (delta < -40) index = Math.max(0, index - 1);
    onState(order[index]);
  }

  return (
    <section
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl border-t border-[#ededed] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-[height] duration-200",
        height,
      )}
      aria-label="Результаты на карте"
    >
      <div
        className="shrink-0 cursor-grab touch-none pt-2 pb-1"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="button"
        tabIndex={0}
        aria-label="Потяните, чтобы раскрыть список"
        onClick={() => onState(state === "expanded" ? "collapsed" : state === "half" ? "expanded" : "half")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onState(state === "expanded" ? "collapsed" : state === "half" ? "expanded" : "half");
          }
        }}
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-[#d0d0d0]" />
        <p className="mt-2 px-4 text-sm font-semibold">
          Найдено {count} {plural(count)}
          {demo ? <span className="font-normal text-[#767676]"> (DEMO)</span> : null}
        </p>
      </div>
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-3 pb-3", state === "collapsed" && "hidden")}>{children}</div>
    </section>
  );
}

export function plural(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "объявление";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объявления";
  return "объявлений";
}
