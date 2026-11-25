"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";

export function FilterDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="mb-3 flex h-11 w-full items-center justify-center rounded-xl bg-tile text-sm font-medium lg:hidden"
        onClick={() => setOpen(true)}
      >
        Фильтры и сортировка
      </button>
      <div className={cn("lg:sticky lg:top-[132px]", open ? "fixed inset-0 z-50 overflow-auto bg-white p-4 lg:static lg:inset-auto lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0" : "hidden lg:block")}>
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <p className="text-lg font-bold">Фильтры</p>
          <button type="button" className="h-10 rounded-xl px-3 text-sm" onClick={() => setOpen(false)}>Закрыть</button>
        </div>
        {children}
      </div>
    </>
  );
}
