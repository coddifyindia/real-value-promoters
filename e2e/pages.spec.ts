import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The browser cancels a page-transition animation if the viewport resizes mid-way
// (e.g. a phone's address bar collapsing). Nothing breaks; the page just doesn't animate.
const BENIGN = ["Transition was aborted because of invalid state"];

const pages = ["/", "/properties", "/properties/diamond-avenue", "/shortlist", "/services", "/about", "/contact"];

for (const path of pages) {
  test(`${path} renders cleanly`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => !BENIGN.some((b) => e.message.includes(b)) && errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && !BENIGN.some((b) => m.text().includes(b)) && errors.push(m.text()));

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await page.waitForLoadState("networkidle");

    // No sideways scrolling at any width: the old site's biggest mobile problem.
    // Measured against clientWidth (the device width), not innerWidth: a phone
    // browser zooms out to fit a too-wide page, which widens innerWidth to match
    // it, so comparing with innerWidth always reads 0. And <main> clips sideways
    // overflow as a safety net, so lift the clip while measuring, or the net
    // would hide the very bug this checks for.
    const overflow = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (main) main.style.overflowX = "visible";
      const px = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      if (main) main.style.overflowX = "";
      return px;
    });
    expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);

    expect(errors, "console / page errors").toEqual([]);
  });

  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page })
      // Third-party embeds (YouTube thumbnail button, Google Maps) are outside our control.
      .exclude("iframe")
      .analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}

test("every page has its own title", async ({ page }) => {
  const titles = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    titles.add(await page.title());
  }
  expect(titles.size).toBe(pages.length);
});

test("unknown property shows the not-found page and is kept out of search", async ({ page }) => {
  // The page streams (the shell is sent before the lookup finishes), so the
  // HTTP status is already 200; Next marks the result noindex instead.
  await page.goto("/properties/does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn't find that page");
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});
