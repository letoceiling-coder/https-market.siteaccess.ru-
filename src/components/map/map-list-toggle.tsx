import { List, Map as MapIcon } from "lucide-react";

export function MapListToggle({ list, onToggle }: { list: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-10 items-center gap-1.5 rounded-full bg-[#222] px-3.5 text-[13px] font-medium text-white shadow-lg"
    >
      {list ? <MapIcon className="size-4" aria-hidden="true" /> : <List className="size-4" aria-hidden="true" />}
      {list ? "Карта" : "Список"}
    </button>
  );
}
