import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Inbox,
  Link2,
  type LucideIcon,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";
import { WhatsAppIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { telLink } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  LEAD_KIND_LABELS,
  LEAD_KINDS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type Lead,
  type LeadKind,
  type LeadStatus,
} from "@/lib/types";
import { LeadEditor } from "./lead-editor";
import { PageHeader, Stat } from "./page-header";
import { SetupNotice } from "./setup-notice";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 50;

export default function LeadsPage({ searchParams }: PageProps<"/admin">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<TableSkeleton label="Loading leads" />}>
      <Leads searchParams={searchParams} />
    </Suspense>
  );
}

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  site_visit_booked: "bg-violet-100 text-violet-800",
  closed: "bg-green-100 text-green-800",
  spam: "bg-slate-200 text-slate-600",
};

async function Leads({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = LEAD_STATUSES.includes(str("status") as LeadStatus) ? (str("status") as LeadStatus) : "";
  const kind = LEAD_KINDS.includes(str("kind") as LeadKind) ? (str("kind") as LeadKind) : "";
  const q = str("q").trim().slice(0, 100);
  const page = Math.max(1, Number(str("page")) || 1);

  const { supabase } = await requireAdmin();

  let query = supabase
    .from("leads")
    .select("id, created_at, kind, status, name, email, phone, message, property_id, property_name, preferred_date, source_path, utm, notes", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  else query = query.neq("status", "spam");
  if (kind) query = query.eq("kind", kind);
  if (q) {
    const like = `%${q.replace(/[%_,()]/g, " ")}%`;
    query = query.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like},property_name.ilike.${like}`);
  }

  const [{ data, count, error }, { count: newCount }] = await Promise.all([
    query,
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  if (error) throw new Error(error.message);
  const leads = (data ?? []) as Lead[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const qs = (overrides: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(kind && { kind }), ...(q && { q }) });
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, String(v));
      else p.delete(k);
    }
    return p.size ? `?${p}` : "";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leads"
        icon={Inbox}
        description="Everyone who sent an enquiry, booked a site visit or asked for a callback on the website. Newest first."
        meta={
          <>
            <Stat tone="blue">{newCount ?? 0} new</Stat>
            <Stat>{count ?? 0} matching</Stat>
          </>
        }
      >
        <a href={`/admin/leads/export${qs({ page: "" })}`} className="btn-outline">
          <Download className="size-4" aria-hidden /> Export CSV
        </a>
      </PageHeader>

      <form className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="label">Search</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Name, phone, email or property" className="field field-icon" />
          </span>
        </label>
        <label>
          <span className="label">Status</span>
          <select name="status" defaultValue={status} className="field select-field">
            <option value="">All except spam</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Type</span>
          <select name="kind" defaultValue={kind} className="field select-field">
            <option value="">All types</option>
            {LEAD_KINDS.map((k) => (
              <option key={k} value={k}>{LEAD_KIND_LABELS[k]}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary self-end sm:col-span-2 lg:col-span-1">
          <SlidersHorizontal className="size-4" aria-hidden /> Apply filters
        </button>
      </form>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            {q || status || kind ? <SearchX className="size-6" aria-hidden /> : <Inbox className="size-6" aria-hidden />}
          </span>
          <p className="font-display text-xl text-navy-900">{q || status || kind ? "No leads match these filters" : "No leads yet"}</p>
          <p className="mt-2 text-slate-500">
            {q || status || kind ? "Try clearing the search or choosing another status." : "They'll appear here as soon as someone submits a form on the website."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? <Link href={`/admin${qs({ page: page - 1 })}`} className="btn-outline"><ChevronLeft className="size-4" aria-hidden /> Previous</Link> : <span />}
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          {page < totalPages ? <Link href={`/admin${qs({ page: page + 1 })}`} className="btn-outline">Next <ChevronRight className="size-4" aria-hidden /></Link> : <span />}
        </nav>
      )}
    </div>
  );
}

const KIND_ICON: Record<LeadKind, LucideIcon> = {
  contact: Mail,
  enquiry: MessageSquareText,
  site_visit: CalendarCheck,
};

function LeadCard({ lead }: { lead: Lead }) {
  const KindIcon = KIND_ICON[lead.kind];
  const digits = lead.phone.replace(/\D/g, "");
  const wa = `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
  const created = new Date(lead.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${STATUS_STYLE[lead.status]}`}>
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {LEAD_STATUS_LABELS[lead.status]}
            </span>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700">
              <KindIcon className="size-3.5" aria-hidden />
              {LEAD_KIND_LABELS[lead.kind]}
            </span>
            <time dateTime={lead.created_at} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="size-3.5" aria-hidden /> {created}
            </time>
          </div>
          <p className="font-display text-2xl leading-tight text-navy-900">{lead.name}</p>
          {lead.property_name && <p className="text-sm text-brand-700">{lead.property_name}</p>}
          {lead.preferred_date && (
            <p className="inline-flex items-center gap-1.5 text-sm text-violet-700">
              <CalendarDays className="size-4" aria-hidden /> Visit on {lead.preferred_date}
            </p>
          )}
          {lead.message && <p className="rounded-xl bg-slate-50 px-4 py-3 leading-relaxed whitespace-pre-line text-slate-700">{lead.message}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <a href={telLink(lead.phone)} className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-medium hover:bg-slate-200">
              <Phone className="size-4" aria-hidden /> {lead.phone}
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-green-50 px-4 text-sm font-medium text-green-800 hover:bg-green-100">
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
            <a href={`mailto:${lead.email}`} className="inline-flex h-11 min-w-0 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-medium hover:bg-slate-200">
              <Mail className="size-4 shrink-0" aria-hidden /> <span className="truncate">{lead.email}</span>
            </a>
          </div>
          {(lead.source_path || lead.utm) && (
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Link2 className="size-3.5 shrink-0" aria-hidden />
              From {lead.source_path ?? "unknown page"}
              {lead.utm && ` · ${Object.values(lead.utm).join(" / ")}`}
            </p>
          )}
        </div>
        <LeadEditor id={lead.id} status={lead.status} notes={lead.notes ?? ""} />
      </div>
    </li>
  );
}
