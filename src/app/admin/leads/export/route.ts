import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { LEAD_KINDS, LEAD_STATUSES, type LeadKind, type LeadStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { supabase } = await requireAdmin();
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status") as LeadStatus | null;
  const kind = sp.get("kind") as LeadKind | null;

  let query = supabase
    .from("leads")
    .select("created_at, kind, status, name, phone, email, property_name, preferred_date, message, notes, source_path, utm")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (status && LEAD_STATUSES.includes(status)) query = query.eq("status", status);
  else query = query.neq("status", "spam");
  if (kind && LEAD_KINDS.includes(kind)) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const columns = ["created_at", "kind", "status", "name", "phone", "email", "property_name", "preferred_date", "message", "notes", "source_path", "utm"];
  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(toCsv(data ?? [], columns), `leads-${date}.csv`);
}
