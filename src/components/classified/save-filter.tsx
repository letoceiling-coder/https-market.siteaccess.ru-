"use client";

import { useState } from "react";
import { useStoredJson } from "@/hooks/storage";

export function SaveFilterButton({ href, label }: { href: string; label: string }) {
  const stored = useStoredJson("hh.saved-filters", parseFilters, [] as { href: string; label: string }[]);
  const [note, setNote] = useState("");

  function save() {
    const next = [{ href, label }, ...stored.value.filter((item) => item.href !== href)].slice(0, 8);
    localStorage.setItem("hh.saved-filters", JSON.stringify(next));
    window.dispatchEvent(new Event("hh-storage"));
    setNote("Фильтр сохранён в этом браузере.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="text-sm text-primary" onClick={save}>Сохранить фильтр</button>
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      {stored.ready && stored.value.length > 0 ? (
        <ul className="flex w-full flex-col gap-1">
          {stored.value.map((item) => (
            <li key={item.href}><a className="text-xs text-primary" href={item.href}>{item.label}</a></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function parseFilters(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is { href: string; label: string } => {
      if (!item || typeof item !== "object") return false;
      const value = item as { href?: string; label?: string };
      return typeof value.href === "string" && typeof value.label === "string";
    });
  } catch {
    return [];
  }
}
