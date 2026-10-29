import type { Metadata } from "next";
import { Suspense } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "../setup-notice";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl">Admin sign in</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">Real Value Promoters team only.</p>
      <Suspense>
        <NotAdminWarning searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </div>
  );
}

async function NotAdminWarning({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { error } = await searchParams;
  if (error !== "not-admin") return null;
  return (
    <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">
      This account isn&apos;t an admin yet. Ask the owner to add you to the <code>admins</code> table.
    </p>
  );
}
