import { Crosshair } from "lucide-react";
import type { ListingKind } from "@/domain/classified";
import { MAP_KIND_LABEL } from "@/services/map-data";
import { cn } from "cn";

export function MapFilterBar({
  kinds,
  kind,
  onKind,
  onLocate,
  query,
  onQuery,
}: {
  kinds: ListingKind[];
  kind: ListingKind | "all";
  onKind: (next: ListingKind | "all") => void;
  onLocate: () => void;
  query: string;
  onQuery: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block">
        <span className="sr-only">Поиск по городу, адресу или категории</span>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Город, адрес или категория"
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-[15px] outline-none focus:border-primary"
        />
      </label>
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        <button type="button" onClick={onLocate} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-[13px] font-medium shadow-sm">
          <Crosshair className="size-4 text-primary" aria-hidden="true" /> Рядом
        </button>
        <Chip active={kind === "all"} onClick={() => onKind("all")}>
          Все
        </Chip>
        {kinds.map((item) => (
          <Chip key={item} active={kind === item} onClick={() => onKind(item)}>
            {MAP_KIND_LABEL[item]}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium shadow-sm",
        active ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground",
      )}
    >
      {children}
    </button>
  );
}
