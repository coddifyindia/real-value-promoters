import { expect, test } from "@playwright/test";

// Guards the sizing rules every control follows:
// - 44px minimum height (and width on touch screens): Apple/Google touch-target guidance, WCAG 2.5.5
// - text fields and dropdowns are at least 48px (the site's control size)
// - controls side by side in a form share one height, so rows line up
// - inputs keep 16px text on touch screens, or iOS zooms the page when they're focused
const pages = ["/", "/properties", "/properties/diamond-avenue", "/shortlist", "/services", "/about", "/contact", "/admin/login"];

for (const path of pages) {
  test(`${path}: controls are consistently sized and touch-friendly`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const touch = info.project.name !== "desktop";

    const issues = await page.evaluate((isTouch) => {
      const out: string[] = [];
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !el.closest("[aria-hidden=true],[inert],.sr-only");
      };
      const name = (el: Element) =>
        (el.getAttribute("aria-label") || el.textContent || (el as HTMLInputElement).name || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);

      const controls = [
        ...document.querySelectorAll(
          "main button, main input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]), main select, main a[class*=btn-], header button, header a[href], footer input, footer button",
        ),
      ].filter(visible);
      for (const el of controls) {
        const r = el.getBoundingClientRect();
        if (r.height < 43.5) out.push(`height ${Math.round(r.height)}px: ${el.tagName} "${name(el)}"`);
        if ((el.tagName === "INPUT" || el.tagName === "SELECT") && r.height < 47.5)
          out.push(`field height ${Math.round(r.height)}px (min 48): ${el.tagName} "${name(el)}"`);
        if (isTouch && r.width < 43.5) out.push(`width ${Math.round(r.width)}px: ${el.tagName} "${name(el)}"`);
      }

      for (const form of document.querySelectorAll("form")) {
        const fields = [...form.querySelectorAll("input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]), select, button")].filter(visible);
        const rows = new Map<number, number[]>();
        for (const f of fields) {
          const r = f.getBoundingClientRect();
          const key = Math.round(r.top / 4);
          rows.set(key, [...(rows.get(key) ?? []), Math.round(r.height)]);
        }
        for (const hs of rows.values()) if (hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 2) out.push(`uneven row ${hs.join("/")}px`);
        if (isTouch)
          for (const f of fields.filter((f) => f.tagName !== "BUTTON")) {
            const size = parseFloat(getComputedStyle(f).fontSize);
            if (size < 16) out.push(`${size}px text (iOS zoom): ${f.tagName} "${name(f)}"`);
          }
      }
      return [...new Set(out)];
    }, touch);

    expect(issues).toEqual([]);
  });
}
