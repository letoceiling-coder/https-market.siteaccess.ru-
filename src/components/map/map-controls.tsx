import { Layers, LocateFixed, Minus, Plus } from "lucide-react";

export function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onToggleType,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onToggleType: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={onZoomIn} className="grid size-11 place-items-center rounded-xl bg-white shadow-md" aria-label="Приблизить">
        <Plus className="size-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={onZoomOut} className="grid size-11 place-items-center rounded-xl bg-white shadow-md" aria-label="Отдалить">
        <Minus className="size-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={onLocate} className="grid size-11 place-items-center rounded-xl bg-white shadow-md" aria-label="Моё местоположение">
        <LocateFixed className="size-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={onToggleType} className="grid size-11 place-items-center rounded-xl bg-white shadow-md" aria-label="Тип карты">
        <Layers className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
