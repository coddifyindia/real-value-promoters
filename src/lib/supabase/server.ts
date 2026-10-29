import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "./config";

// Per-request client that acts as the signed-in admin, so RLS applies.
export async function createSessionClient() {
  // Admin data is per-request: opt out of prerendering and prefetch-time
  // rendering (supabase-js reads the clock to check session expiry).
  await connection();
  const cookieStore = await cookies();
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase is not configured");
  }
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
