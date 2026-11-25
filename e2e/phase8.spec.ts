import { expect, test } from "@playwright/test";

test("home: categories stay readable and catalog is reachable", async ({ page }) => {
  await page.goto("/");
  const categories = page.getByRole("region", { name: "Категории" });
  await expect(categories.getByRole("link", { name: "Авто" })).toBeVisible();
  await expect(categories.getByRole("link", { name: "Аренда" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Все категории" }).first()).toBeVisible();
  const firstTitle = page.locator("article h3").first();
  await expect(firstTitle).toBeVisible();
  const box = await firstTitle.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(16);
  expect(box?.height ?? 0).toBeLessThan(48);
});

test("catalog filters stay in the URL", async ({ page }) => {
  await page.goto("/catalog/transport/legkovye");
  const width = page.viewportSize()?.width ?? 390;
  if (width < 1024) {
    await page.getByRole("button", { name: /Все фильтры/ }).click();
    await page.getByLabel("Цена от").fill("100000");
    await page.getByRole("button", { name: "Показать результаты" }).click();
  } else {
    await page.locator('input[name="priceMin"]').fill("100000");
    await page.getByRole("button", { name: "Показать" }).click();
  }
  await expect(page).toHaveURL(/priceMin=100000/);
});

test("map shows setup state without a Yandex key and keeps the list usable", async ({ page }) => {
  await page.goto("/map");
  await expect(page.getByText(/Требуется настройка Яндекс Карт|Найдено/)).toBeVisible();
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  const width = page.viewportSize()?.width ?? 390;
  if (width < 1024) {
    await expect(page.getByRole("button", { name: "Список" })).toBeVisible();
    const list = page.getByRole("button", { name: "Список" });
    const firstCard = page.locator("[data-point]").first();
    if (await firstCard.count()) {
      const listBox = await list.boundingBox();
      const cardBox = await firstCard.boundingBox();
      if (listBox && cardBox) {
        const overlap = !(listBox.y + listBox.height < cardBox.y || cardBox.y + cardBox.height < listBox.y || listBox.x + listBox.width < cardBox.x || cardBox.x + cardBox.width < listBox.x);
        expect(overlap).toBeFalsy();
      }
    }
  }
});

test("listing page keeps actions above the bottom nav", async ({ page }) => {
  await page.goto("/samples/car-coupe");
  const write = page.getByRole("link", { name: "Написать" });
  await expect(write).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Мобильные разделы" });
  if (await nav.isVisible()) {
    const writeBox = await write.boundingBox();
    const navBox = await nav.boundingBox();
    expect((writeBox?.y ?? 0) + (writeBox?.height ?? 0)).toBeLessThanOrEqual((navBox?.y ?? 0) + 2);
  }
});
