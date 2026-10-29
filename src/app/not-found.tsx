import type { Metadata } from "next";
import Link from "next/link";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-x flex flex-1 flex-col items-center py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-4xl">We couldn&apos;t find that page</h1>
        <p className="mt-4 max-w-md text-slate-600">
          The project may have sold out or moved. Browse our current projects or get in touch.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/properties" className="btn-primary">View properties</Link>
          <Link href="/contact" className="btn-outline">Contact us</Link>
        </div>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
