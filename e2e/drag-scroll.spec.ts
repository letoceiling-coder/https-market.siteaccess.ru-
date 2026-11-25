import { expect, test, type Locator, type Page } from "@playwright/test";

// Desktop mouse navigation of horizontal rows: no visible scrollbar, drag, wheel, arrows, snapping gallery.
test.use({ viewport: { width: 1366, height: 860 } });
test.setTimeout(90_000);

async function drag(page: Page, target: Locator, from: number, to: number) {
  const box = (await target.boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + from, y);
  await page.mouse.down();
  await page.mouse.move(box.x + from - Math.sign(from - to) * 10, y, { steps: 2 });
  await page.mouse.move(box.x + to, y, { steps: 8 });
  await page.mouse.up();
}

test("subcategory rail: no scrollbar, wheel, drag without navigation, arrow", async ({ page }) => {
  await page.goto("/catalog/elektronika");
  const rail = page.getByRole("group", { name: "Подкатегории" });
  await expect(rail).toBeVisible();
  const scrollbar = await rail.evaluate((el) => el.offsetHeight - el.clientHeight);
  expect(scrollbar).toBe(0);

  const box = (await rail.boundingBox())!;
  await page.mouse.move(box.x + box.width / 3, box.y + box.height / 2);
  await page.mouse.wheel(0, 150);
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);

  await rail.evaluate((el) => (el.scrollLeft = 0));
  const url = page.url();
  await drag(page, rail, 600, 300);
  expect(await rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  await page.waitForTimeout(300);
  expect(page.url()).toBe(url); // the drag must not open the chip under the cursor

  await rail.evaluate((el) => (el.scrollLeft = 0));
  const next = rail.locator("..").locator("button").last();
  await next.click();
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
});

test("gallery: a short mouse flick moves exactly one photo", async ({ page }) => {
  await page.goto("/samples/g-flat-2k-loft");
  const gallery = page.locator('[aria-roledescription="карусель"]');
  await expect(gallery).toBeVisible();
  const width = await gallery.evaluate((el) => el.clientWidth);
  const slide = () => gallery.evaluate((el) => Math.round(el.scrollLeft / el.clientWidth));
  const exact = () => gallery.evaluate((el) => Math.abs(el.scrollLeft / el.clientWidth - Math.round(el.scrollLeft / el.clientWidth)) < 0.02);

  await drag(page, gallery, width * 0.7, width * 0.5);
  await expect.poll(slide).toBe(1);
  await expect.poll(exact).toBe(true);

  await drag(page, gallery, width * 0.3, width * 0.5);
  await expect.poll(slide).toBe(0);

  await drag(page, gallery, width * 0.7, width * 0.66); // too short: stays
  await expect.poll(exact).toBe(true);
  expect(await slide()).toBe(0);
});
