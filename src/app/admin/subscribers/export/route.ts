import { requireAdmin } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("subscribers")
    .select("email, created_at, source_path")
    .is("unsubscribed_at", null)
    .order("created_at", { ascending: false });
  if (error) return new Response(error.message, { status: 500 });

  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(toCsv(data ?? [], ["email", "created_at", "source_path"]), `subscribers-${date}.csv`);
}
