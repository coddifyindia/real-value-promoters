import { BellRing, CalendarDays, Download, FileText, Mail, MailX } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PageHeader, Stat } from "../page-header";
import { SetupNotice } from "../setup-notice";

export const metadata: Metadata = { title: "Launch alerts" };

export default function SubscribersPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<TableSkeleton label="Loading subscribers" />}>
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
    <div className="space-y-8">
      <PageHeader
        title="New-launch alerts"
        icon={BellRing}
        description={
          <>
            People who typed their email into the <strong className="text-navy-900">“New-launch alerts”</strong> box at the
            bottom of every page of the website, asking to hear about new projects and pre-launch prices. Nothing is
            sent automatically: when you have a launch to announce, export this list and email it from Gmail or your
            mailing tool.
          </>
        }
        meta={<Stat tone="green">{count ?? 0} people signed up</Stat>}
      >
        <a href="/admin/subscribers/export" className="btn-outline">
          <Download className="size-4" aria-hidden /> Export CSV
        </a>
      </PageHeader>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium"><span className="inline-flex items-center gap-1.5"><Mail className="size-4" aria-hidden /> Email</span></th>
              <th className="px-6 py-4 font-medium"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden /> Signed up</span></th>
              <th className="hidden px-6 py-4 font-medium sm:table-cell"><span className="inline-flex items-center gap-1.5"><FileText className="size-4" aria-hidden /> Signed up on page</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium text-navy-900">{s.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {new Date(s.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
                </td>
                <td className="hidden px-6 py-4 text-slate-500 sm:table-cell">{s.source_path ?? "–"}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={3} className="px-6 py-14 text-center text-slate-500"><MailX className="mx-auto mb-3 size-8 text-slate-400" aria-hidden />No sign-ups yet. They appear here when someone uses the “New-launch alerts” box in the website footer.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
