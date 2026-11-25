/** Shown wherever DEMO cards are visible. Never rendered in public mode (there are no demo cards then). */
export function DemoBanner() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-signal/35 px-3 py-1 text-[12px] leading-4 text-foreground/80">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-foreground/60" />
      Тестовые объявления: продавцы и цены вымышлены
    </p>
  );
}
