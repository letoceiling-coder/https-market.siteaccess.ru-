export function MapSearchArea({ count, onSearch, visible }: { count: number; onSearch: () => void; visible: boolean }) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onSearch}
      className="rounded-full bg-white px-4 py-2 text-[13px] font-medium shadow-md"
    >
      Искать здесь · {count}
    </button>
  );
}
