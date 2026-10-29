"use client";

import { Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from "./icons";
import { Logo } from "./logo";
import { nav, site, whatsappLink } from "@/lib/site";

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// The URL isn't known while prerendering dynamic routes, so the prerendered
// shell gets the header without an active link, then the real one streams in.
export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderView pathname={null} />}>
      <HeaderWithPath />
    </Suspense>
  );
}

function HeaderWithPath() {
  return <HeaderView pathname={usePathname()} />;
}

function HeaderView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="hidden bg-navy-900 text-sm text-white/80 md:block">
        <div className="container-x flex h-10 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${site.phone.tel}`} className="inline-flex items-center gap-2 hover:text-white">
              <Phone className="size-4" aria-hidden /> {site.phone.display}
            </a>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-white">
              <Mail className="size-4" aria-hidden /> {site.email}
            </a>
          </div>
          <div className="flex items-center gap-1">
            <SocialLinks />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
          <Logo className="h-12 w-auto md:h-16" />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-navy-900 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact#enquire" className="btn-primary hidden sm:inline-flex">
              Book a site visit
            </Link>
            <a
              href={`tel:${site.phone.tel}`}
              className="inline-flex size-11 items-center justify-center rounded-full text-navy-900 hover:bg-slate-100 sm:hidden"
              aria-label={`Call ${site.phone.display}`}
            >
              <Phone className="size-5" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full text-navy-900 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        inert={!open}
      >
        <div
          className={`absolute inset-0 bg-navy-950/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-white shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <span className="font-display text-lg text-navy-900">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="size-6" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-4">
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-slate-800 hover:bg-slate-100 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-slate-200 p-4">
            <Link href="/contact#enquire" onClick={() => setOpen(false)} className="btn-primary w-full">
              Book a site visit
            </Link>
            <a href={whatsappLink("Hi, I'd like to know more about your properties.")} className="btn-whatsapp w-full">
              <WhatsAppIcon className="size-5" /> WhatsApp us
            </a>
            <a href={`tel:${site.phone.tel}`} className="btn-outline w-full">
              <Phone className="size-4" aria-hidden /> {site.phone.display}
            </a>
            <div className="flex justify-center gap-1 pt-1 text-slate-600">
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function SocialLinks({ className = "hover:text-white" }: { className?: string }) {
  const links = [
    { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.social.youtube, label: "YouTube", Icon: YouTubeIcon },
  ];
  return links.map(({ href, label, Icon }) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded-full transition-colors ${className}`}
    >
      <Icon className="size-[18px]" />
    </a>
  ));
}
