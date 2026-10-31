"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";

/**
 * Instant feedback inside a <Link> while its page loads, so a tap on slow
 * mobile data never feels ignored. Must be rendered inside the Link.
 */
export function LinkPending({ variant = "underline" }: { variant?: "underline" | "card" }) {
  const { pending } = useLinkStatus();
  if (variant === "card") {
    return (
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex aspect-[4/3] items-center justify-center bg-navy-950/30 backdrop-blur-[2px] transition-opacity duration-200 ${pending ? "opacity-100" : "opacity-0"}`}
      >
        <Loader2 className="size-8 animate-spin text-white" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold-400 transition-transform duration-500 ${pending ? "scale-x-100" : "scale-x-0"}`}
    />
  );
}
