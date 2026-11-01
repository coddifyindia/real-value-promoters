"use client";

import { track } from "@vercel/analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { Suspense, useEffect } from "react";

/**
 * Page views via Vercel Web Analytics (cookie-free, no consent banner needed),
 * plus conversion events for the actions that matter to the sales team.
 * Custom events show up on Vercel's Pro plan; page views work on every plan.
 */
export function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const path = window.location.pathname;
      if (href.startsWith("tel:")) track("Call click", { path });
      else if (href.includes("wa.me/")) track("WhatsApp click", { path });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <Suspense fallback={null}>
      <VercelAnalytics />
    </Suspense>
  );
}
