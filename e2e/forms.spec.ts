import { expect, test } from "@playwright/test";

const withDb = process.env.E2E_SUPABASE === "1";

test("invalid enquiry shows errors and keeps what was typed", async ({ page }) => {
  await page.goto("/properties/diamond-avenue");
  const form = page.locator("#enquire form");
  await form.getByLabel("Full name").fill("Priya");
  await form.getByLabel("Phone / WhatsApp").fill("123");
  await form.getByRole("button", { name: "Send enquiry" }).click();

  await expect(form.getByText("Enter a valid phone number")).toBeVisible();
  await expect(form.getByText("Enter a valid email address")).toBeVisible();
  await expect(form.getByLabel("Full name")).toHaveValue("Priya");
  await expect(form.getByLabel("Phone / WhatsApp")).toHaveAttribute("aria-invalid", "true");
});

test("site visit needs a date", async ({ page }) => {
  await page.goto("/properties/diamond-avenue");
  const form = page.locator("#enquire form");
  await form.getByRole("radio", { name: "Site visit" }).click();
  await expect(form.getByLabel("Preferred visit date")).toBeVisible();
  await expect(form.getByRole("button", { name: "Request site visit" })).toBeVisible();
});

test.describe("with database", () => {
  test.skip(!withDb, "needs local Supabase (E2E_SUPABASE=1)");

  test("enquiry is saved and offers WhatsApp hand-off", async ({ browser }, info) => {
    // A unique client IP per run, so the 5-per-10-minutes rate limit doesn't trip on reruns.
    const ip = `10.${info.workerIndex}.${Date.now() % 250}.${Math.floor(Math.random() * 250)}`;
    const context = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": ip } });
    const page = await context.newPage();

    await page.goto("/properties/diamond-avenue");
    const form = page.locator("#enquire form");
    await form.getByLabel("Full name").fill("E2E Test Buyer");
    await form.getByLabel("Phone / WhatsApp").fill("98765 43210");
    await form.getByLabel("Email").fill(`e2e+${info.project.name}@example.com`);
    // Real people take a few seconds; instant submissions are treated as bots.
    await page.waitForTimeout(2800);
    await form.getByRole("button", { name: "Send enquiry" }).click();

    await expect(page.getByText("Thank you! We've got your request.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue on WhatsApp" })).toHaveAttribute("href", /wa\.me\/.*Diamond%20Avenue/);
    await context.close();
  });

  test("newsletter sign-up", async ({ page }, info) => {
    await page.goto("/");
    await page.waitForTimeout(2800);
    const footer = page.locator("footer");
    await footer.getByRole("textbox", { name: /email/i }).fill(`e2e-news+${info.project.name}-${Date.now()}@example.com`);
    await footer.getByRole("button", { name: "Subscribe" }).click();
    await expect(footer.getByText("You're subscribed")).toBeVisible();
  });

  test("admin area is login-protected", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
