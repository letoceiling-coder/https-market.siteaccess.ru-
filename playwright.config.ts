import { defineConfig, devices } from "@playwright/test";

const viewports = [
  { name: "320", width: 320, height: 579 },
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1600", width: 1600, height: 900 },
];

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    locale: "ru-RU",
  },
  projects: viewports.map((viewport) => ({
    name: viewport.name,
    use: { ...devices["Desktop Chrome"], viewport: { width: viewport.width, height: viewport.height } },
  })),
});
