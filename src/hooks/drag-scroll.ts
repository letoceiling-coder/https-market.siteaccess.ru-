"use client";

import { useEffect, type RefObject } from "react";

/**
 * Desktop-grade horizontal scrolling for an overflow-x container.
 * - Mouse drag pans the row (touch keeps native scrolling). A drag never triggers the link under the cursor.
 * - `wheel`: vertical mouse wheel scrolls the row sideways until an edge, then the page scrolls as usual.
 * - `snap`: after a drag the row settles on the nearest child, like a native swipe.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>, { wheel = true, snap = false } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startLeft = 0;
    let pointerId = -1;
    let dragging = false;
    let suppressClick = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || el.scrollWidth <= el.clientWidth) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      dragging = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6) return;
        dragging = true;
        el.style.scrollSnapType = "none";
        el.style.scrollBehavior = "auto";
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
        try {
          el.setPointerCapture(pointerId);
        } catch {
          /* pointer already gone: keep panning without capture */
        }
      }
      el.scrollLeft = startLeft - dx;
    };

    const finish = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = -1;
      if (!dragging) return;
      dragging = false;
      suppressClick = true;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);      el.style.cursor = "";
      el.style.userSelect = "";
      el.style.scrollBehavior = "";
      if (snap) {
        // Like a native swipe: a short flick is enough to move one item in the drag direction.
        const base = el.getBoundingClientRect().left - el.scrollLeft;
        const offsets = ([...el.children] as HTMLElement[]).map((child) => child.getBoundingClientRect().left - base);
        const nearest = (left: number) =>
          offsets.reduce((best, offset, index) => (Math.abs(offset - left) < Math.abs(offsets[best] - left) ? index : best), 0);
        const from = nearest(startLeft);
        const moved = el.scrollLeft - startLeft;
        const step = Math.abs(moved) > el.clientWidth * 0.12 ? Math.sign(moved) : 0;
        const index = Math.min(offsets.length - 1, Math.max(0, from + step));
        el.scrollTo({ left: offsets[index] ?? 0, behavior: "smooth" });
        window.setTimeout(() => (el.style.scrollSnapType = ""), 400);
      } else {
        el.style.scrollSnapType = "";
      }
    };

    // A finished drag swallows the click that the browser fires right after pointerup.
    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onDragStart = (event: DragEvent) => event.preventDefault();

    const onWheel = (event: WheelEvent) => {
      if (!wheel || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY;
      const atStart = el.scrollLeft <= 0 && delta < 0;
      const atEnd = el.scrollLeft >= max - 1 && delta > 0;
      if (atStart || atEnd) return; // let the page scroll on
      event.preventDefault();
      el.scrollLeft += delta;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", finish);
      el.removeEventListener("pointercancel", finish);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("wheel", onWheel);
    };
  }, [ref, wheel, snap]);
}
