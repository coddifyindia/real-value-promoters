"use client";

import { BellRing, Building2, Clapperboard, ExternalLink, Inbox, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/admin";

const links = [
  { href: "/admin", label: "Leads", icon: Inbox },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/banner", label: "Banner video", icon: Clapperboard },
  { href: "/admin/subscribers", label: "Launch alerts", icon: BellRing },
];

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="container-x flex h-16 items-center gap-1 sm:gap-3">
        <span className="mr-1 inline-flex shrink-0 sm:mr-3 items-center gap-2 font-display text-xl text-navy-900">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
            <LayoutDashboard className="size-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">RVP Admin</span>
        </span>
        <nav aria-label="Admin" className="flex shrink-0 gap-0.5 sm:gap-1">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                aria-label={l.label}
                title={l.label}
                className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm sm:h-10 sm:px-4 font-medium text-slate-600 hover:bg-slate-100 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-700"
              >
                <l.icon className="size-5 shrink-0 sm:size-4" aria-hidden />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link href="/" target="_blank" rel="noopener" aria-label="View site" title="View site" className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm sm:h-10 sm:px-4 text-slate-600 hover:bg-slate-100">
            <ExternalLink className="size-4" aria-hidden /> <span className="hidden sm:inline">View site</span>
          </Link>
          <form action={signOut}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm sm:h-10 sm:px-4 text-slate-600 hover:bg-slate-100">
              <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
