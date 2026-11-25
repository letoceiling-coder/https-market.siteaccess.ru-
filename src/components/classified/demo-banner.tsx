/** Shown wherever DEMO cards are visible. Never rendered in public mode (there are no demo cards then). */
export function DemoBanner() {
  return (
    <p className="inline-flex items-center gap-2 rounded-lg bg-[#f2f1f0] px-2.5 py-1 text-[12px] leading-4 text-[#555]">
      <span className="rounded bg-[#222]/80 px-1.5 py-0.5 text-[10px] leading-3 font-semibold tracking-wide text-white">DEMO</span>
      Образцы оформления, не реальные объявления
    </p>
  );
}
