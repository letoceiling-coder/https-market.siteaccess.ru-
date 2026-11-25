import { cn } from "cn";

/** Wordmark: roof mark + HELP HOMES set in Unbounded. `tone="light"` is for the spruce app bar. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-display leading-none font-semibold tracking-[-0.02em]", className)}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className="size-[1.35em] shrink-0">
        <rect width="64" height="64" rx="16" fill={tone === "light" ? "#ffffff" : "var(--primary)"} />
        <path d="M14 30 32 15l18 15" fill="none" stroke="var(--signal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 50V31m20 19V31M22 40h20" fill="none" stroke={tone === "light" ? "var(--primary)" : "#ffffff"} strokeWidth="5" strokeLinecap="round" />
      </svg>
      <span className={tone === "light" ? "text-white" : "text-foreground"}>
        help<span className={tone === "light" ? "text-white/70" : "text-primary"}>homes</span>
      </span>
    </span>
  );
}
