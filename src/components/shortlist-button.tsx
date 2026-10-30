"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useShortlist } from "@/lib/shortlist";

export function ShortlistButton({ slug, name, variant = "overlay" }: { slug: string; name: string; variant?: "overlay" | "inline" }) {
  const { has, toggle } = useShortlist();
  const saved = has(slug);
  const label = saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`;

  if (variant === "inline") {
    return (
      <button type="button" onClick={() => toggle(slug)} aria-pressed={saved} className="btn-outline group/heart">
        <Heart
          className={`size-4 transition-transform group-active/heart:scale-125 ${saved ? "fill-red-500 text-red-500" : ""}`}
          aria-hidden
        />
        {saved ? "Saved to shortlist" : "Save to shortlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved" : "Save to shortlist"}
      // z-10 lifts it above the card's full-size link overlay.
      className="relative z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-sm backdrop-blur transition hover:scale-110 active:scale-95"
    >
      <Heart
        className={`size-5 transition-all duration-300 ${saved ? "scale-110 fill-red-500 text-red-500" : ""}`}
        aria-hidden
      />
    </button>
  );
}

export function ShortlistLink({ className = "" }: { className?: string }) {
  const { slugs } = useShortlist();
  return (
    <Link
      href="/shortlist"
      aria-label={`Shortlist (${slugs.length} saved)`}
      className={`relative inline-flex size-11 items-center justify-center rounded-full text-navy-900 hover:bg-slate-100 ${className}`}
    >
      <Heart className="size-5" aria-hidden />
      {slugs.length > 0 && (
        <span
          key={slugs.length}
          className="enter absolute top-1 right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] leading-5 font-bold text-white"
        >
          {slugs.length}
        </span>
      )}
    </Link>
  );
}
