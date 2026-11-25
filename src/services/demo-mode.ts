/**
 * UI_DEMO_MODE isolates test cards from real output.
 *
 * - Off (default, production): no demo listing is read, rendered, indexed or linked.
 * - On (UI_DEMO_MODE=true in .env.local): test cards appear with a DEMO badge.
 *
 * The flag is read on the server only. Demo data lives in src/data/demo.
 */
export const UI_DEMO_MODE = process.env.UI_DEMO_MODE === "true";

export function isDemoMode() {
  return UI_DEMO_MODE;
}
