import { requireAdmin } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("subscribers")
    .select("email, created_at, source_path")
    .is("unsubscribed_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin] subscribers export failed", error);
    return new Response("Export failed: the database didn't respond. Go back and try again.", { status: 503, headers: { "Retry-After": "30" } });
  }

  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(toCsv(data ?? [], ["email", "created_at", "source_path"]), `subscribers-${date}.csv`);
}
