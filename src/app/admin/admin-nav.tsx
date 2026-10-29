"use client";

import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/admin";

const links = [
  { href: "/admin", label: "Leads" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="container-x flex h-14 items-center gap-2 overflow-x-auto">
        <span className="mr-2 shrink-0 font-display text-lg text-navy-900">RVP Admin</span>
        <nav aria-label="Admin" className="flex shrink-0 gap-1">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-700"
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link href="/" target="_blank" className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            <ExternalLink className="size-4" aria-hidden /> <span className="hidden sm:inline">View site</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
              <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
