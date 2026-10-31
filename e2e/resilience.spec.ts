import { expect, test } from "@playwright/test";

test("security headers are sent", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["cross-origin-opener-policy"]).toBe("same-origin");
  expect(h["x-powered-by"]).toBeUndefined();

  const admin = await request.get("/admin/login");
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
});

test("security.txt is published", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.ok()).toBe(true);
  expect(await res.text()).toContain("Contact:");
});

test("a dropped connection while sending keeps the form and offers WhatsApp", async ({ page }) => {
  await page.goto("/contact");
  await page.waitForLoadState("networkidle");
  const form = page.locator("#enquire form");
  await form.getByLabel("Full name").fill("Offline Buyer");
  await form.getByLabel("Phone / WhatsApp").fill("98765 43210");
  await form.getByLabel("Email").fill("offline@example.com");

  // Server actions POST to the page URL; simulate the network dying mid-request.
  await page.route("**/contact", (route) => (route.request().method() === "POST" ? route.abort("internetdisconnected") : route.continue()));
  await form.getByRole("button", { name: "Send enquiry" }).click();

  await expect(form.getByRole("alert")).toContainText("couldn't reach our server");
  await expect(form.getByRole("link", { name: "Message us on WhatsApp" })).toBeVisible();
  await expect(form.getByLabel("Full name")).toHaveValue("Offline Buyer");
});

test("the 404 page offers ways forward", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn't find that page");
  await expect(page.getByRole("link", { name: /Browse all projects/ })).toBeVisible();
});
