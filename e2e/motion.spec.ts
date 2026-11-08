import { expect, test } from "@playwright/test";

const animationOf = (sel: string) => getComputedStyle(document.querySelector(sel)!).animationName;

test("hero video plays, muted and looping", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const video = page.locator("#hero video");
  await expect(video).toHaveAttribute("poster", /hero-poster/);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime > 0 && !v.paused)).toBe(true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop)).toBe(true);
});

test("all motion is off when the visitor asks for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // The video never starts: the poster stays as a still image.
  await page.waitForTimeout(1500);
  expect(await page.locator("#hero video").evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
  expect(await page.evaluate(animationOf, ".enter")).toBe("none");
  // Content is fully visible without animation.
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1");
});
