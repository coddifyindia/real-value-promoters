import { Download } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "../setup-notice";

export const metadata: Metadata = { title: "Subscribers" };

export default function SubscribersPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      <Subscribers />
    </Suspense>
  );
}

async function Subscribers() {
  const { supabase } = await requireAdmin();
  const { data, count, error } = await supabase
    .from("subscribers")
    .select("id, email, created_at, source_path", { count: "exact" })
    .is("unsubscribed_at", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-slate-600">{count ?? 0} subscribed</p>
        </div>
        <a href="/admin/subscribers/export" className="btn-outline">
          <Download className="size-4" aria-hidden /> Export CSV
        </a>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Subscribed</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-navy-900">{s.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {new Date(s.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
                </td>
                <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{s.source_path ?? "–"}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-500">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
