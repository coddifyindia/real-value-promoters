import { expect, test } from "@playwright/test";

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function emi(p: number, annual: number, months: number) {
  const r = annual / 1200;
  const f = (1 + r) ** months;
  return Math.round((p * r * f) / (f - 1));
}

test("EMI updates as the visitor changes the loan", async ({ page }) => {
  await page.goto("/properties/diamond-avenue");
  const monthly = page.getByTestId("emi-monthly");
  // Defaults: ₹7,75,000 price, 25% down, 9.5%, 10 years.
  await expect(monthly).toHaveText(inr(emi(581_250, 9.5, 120)));
  // The figure above is server-rendered; wait for React to take over the sliders.
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Loan tenure").fill("15");
  await page.getByLabel("Down payment").fill("40");
  await expect(monthly).toHaveText(inr(emi(465_000, 9.5, 180)));

  await page.getByLabel("Property price").fill("1000000");
  await expect(monthly).toHaveText(inr(emi(600_000, 9.5, 180)));
});

test("price-per-sq.ft projects don't show a calculator", async ({ page }) => {
  await page.goto("/properties/ar-avenue-maththur");
  await expect(page.getByTestId("emi-monthly")).toHaveCount(0);
});
