import { expect, test } from "@playwright/test";

const animationOf = (sel: string) => getComputedStyle(document.querySelector(sel)!).animationName;

test("hero slideshow animates", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  expect(await page.evaluate(animationOf, ".hero-slide")).toBe("hero-cycle");
});

test("all motion is off when the visitor asks for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(animationOf, ".hero-slide")).toBe("none");
  expect(await page.evaluate(animationOf, ".enter")).toBe("none");
  // Content is fully visible without animation.
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1");
});
