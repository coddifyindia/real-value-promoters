import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

// Secret-key client: bypasses RLS. Only for server code that has already
// validated its input (public form submissions).
export function createServiceClient() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secret) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
