import { expect, test } from "@playwright/test";

test("filters by city and keeps them in the URL", async ({ page }) => {
  await page.goto("/properties");
  await page.getByLabel("City").selectOption("Trichy");
  await expect(page).toHaveURL(/city=Trichy/);
  const cards = page.locator("main article:visible");
  await expect(cards.first()).toBeVisible();
  for (const card of await cards.all()) await expect(card).toContainText("Trichy");

  // A shared link opens with the same filter applied.
  await page.reload();
  await expect(page.getByLabel("City")).toHaveValue("Trichy");
});

test("search narrows results and can be cleared", async ({ page }) => {
  await page.goto("/properties");
  const total = await page.locator("main article:visible").count();
  await page.getByRole("searchbox", { name: "Search properties" }).fill("diamond");
  await expect(page.locator("main article:visible")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("main article:visible")).toHaveCount(total);
});

test("old numbered URLs redirect permanently to the new ones", async ({ request }) => {
  const res = await request.get("/properties/1", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toBe("/properties/venus-garden");
});

test("opening a card goes to the project page", async ({ page }) => {
  await page.goto("/properties");
  await page.getByRole("link", { name: "Diamond Avenue" }).click();
  await expect(page).toHaveURL(/\/properties\/diamond-avenue$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Diamond Avenue");
});

test("gallery steps through photos", async ({ page }) => {
  await page.goto("/properties/diamond-avenue");
  const counter = page.getByText(/^1 \/ \d+$/);
  await expect(counter).toBeVisible();
  await page.getByRole("button", { name: "Next photo" }).first().click();
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
});

test("search engines get a sitemap, robots.txt and structured data", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/properties/diamond-avenue");
  expect(sitemap).not.toContain("/shortlist");
  expect(await (await request.get("/robots.txt")).text()).toMatch(/Sitemap:/);

  await page.goto("/properties/diamond-avenue");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join()).toContain('"RealEstateListing"');
});
