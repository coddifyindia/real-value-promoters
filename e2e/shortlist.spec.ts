import { expect, test } from "@playwright/test";

test("save projects, compare them, and enquire about all at once", async ({ page }) => {
  await page.goto("/properties");
  await page.getByRole("button", { name: "Save Diamond Avenue to shortlist" }).click();
  await page.getByRole("button", { name: "Save Opal Garden to shortlist" }).click();
  await expect(page.getByRole("button", { name: "Remove Diamond Avenue from shortlist" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Shortlist (2 saved)" })).toBeVisible();

  await page.getByRole("link", { name: /Shortlist \(2 saved\)/ }).click();
  await expect(page).toHaveURL(/\/shortlist$/);
  await expect(page.locator("main article:visible")).toHaveCount(2);
  await expect(page.getByRole("table")).toContainText("Diamond Avenue");
  await expect(page.getByLabel(/Message/)).toHaveValue("I'm interested in: Opal Garden, Diamond Avenue.");

  // Survives a reload (stored on the device).
  await page.reload();
  await expect(page.locator("main article:visible")).toHaveCount(2);

  await page.getByRole("button", { name: "Remove Opal Garden from shortlist" }).click();
  await expect(page.locator("main article:visible")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page.getByText("Nothing saved yet")).toBeVisible();
});

test("save from a project page", async ({ page }) => {
  await page.goto("/properties/golden-farms");
  await page.getByRole("button", { name: "Save to shortlist" }).click();
  await expect(page.getByRole("button", { name: "Saved to shortlist" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Shortlist (1 saved)" })).toBeVisible();
});
