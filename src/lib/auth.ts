import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";

// Every admin page and action goes through this. RLS enforces the same rule in
// the database, so a bug here can't leak data.
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=not-admin");

  return { supabase, user };
}
