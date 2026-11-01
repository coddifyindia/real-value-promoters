import { ArrowRight, Building2, Heart, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

const ways = [
  { href: "/properties", icon: Building2, title: "Browse all projects", text: "Plots, villas and farm land across Tamil Nadu" },
  { href: "/shortlist", icon: Heart, title: "Your shortlist", text: "Projects you've saved on this device" },
  { href: "/contact", icon: MessageSquareText, title: "Talk to us", text: "We'll find the right project for you" },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative isolate flex-1 overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-brand-50 to-transparent" aria-hidden />
        <div className="container-x flex flex-col items-center py-16 text-center sm:py-24">
          <p
            className="enter font-display text-[clamp(6rem,22vw,13rem)] leading-none text-transparent [-webkit-text-stroke:2px_var(--color-gold-400)]"
            aria-hidden
          >
            404
          </p>
          <h1 className="enter mt-2 text-3xl sm:text-4xl" style={{ "--d": 1 } as React.CSSProperties}>
            We couldn&apos;t find that page
          </h1>
          <p className="enter mt-4 max-w-md text-slate-600" style={{ "--d": 2 } as React.CSSProperties}>
            The project may have sold out or moved, or the link has a typo. Here are some ways forward.
          </p>
          <ul className="enter mt-10 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3" style={{ "--d": 3 } as React.CSSProperties}>
            {ways.map(({ href, icon: Icon, title, text }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="mt-4 flex items-center gap-1 font-semibold text-navy-900">
                    {title}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                  <span className="mt-1 text-sm text-slate-600">{text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
