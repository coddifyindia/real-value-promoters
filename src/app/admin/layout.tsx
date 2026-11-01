import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      {/* The nav reads the URL, which isn't known while prerendering dynamic admin routes. */}
      <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
        <AdminNav />
      </Suspense>
      <main className="container-x flex-1 py-8 sm:py-12">{children}</main>
    </div>
  );
}
