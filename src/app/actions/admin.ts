"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { PROPERTIES_TAG } from "@/lib/properties";
import { createSessionClient } from "@/lib/supabase/server";
import { lines, parseJsonArray, propertySchema } from "@/lib/property-schema";
import { LEAD_STATUSES } from "@/lib/types";
import { fieldErrorsOf, type FormState } from "@/lib/validation";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Enter your email and password." };

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Supabase rate-limits repeated attempts (status 429); say so instead of "wrong password".
      if (error.status === 429) return { status: "error", message: "Too many attempts. Wait a minute and try again." };
      return { status: "error", message: "Incorrect email or password." };
    }
  } catch (err) {
    console.error("[admin] sign-in failed", err);
    return { status: "error", message: "Sign-in is unavailable right now. Please try again shortly." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const leadUpdate = z.object({
  id: z.uuid(),
  status: z.enum(LEAD_STATUSES),
  notes: z.string().max(4000).optional().default(""),
});

export async function updateLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = leadUpdate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Invalid update." };

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data.status, notes: parsed.data.notes || null })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin] lead update failed", error);
    return { status: "error", message: "Couldn't save. Please try again." };
  }
  return { status: "success", message: "Saved" };
}

// The data tag covers every page that lists properties. Detail pages (and the
// shell new slugs render from) are prerendered with that data baked in, so
// expire the whole route pattern too; otherwise the first visit is stale.
function refreshPublicPages() {
  updateTag(PROPERTIES_TAG);
  revalidatePath("/properties/[slug]", "page");
}

export async function saveProperty(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const parsed = propertySchema.safeParse({
    ...raw,
    id: raw.id || undefined,
    amenities: lines(raw.amenities),
    images: parseJsonArray(raw.images),
    contact_phones: lines(String(raw.contact_phones ?? "").replace(/,/g, "\n")).map((p) => p.replace(/[\s()-]/g, "")),
    featured: raw.featured === "on",
    published: raw.published === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const { supabase } = await requireAdmin();
  const { id, ...values } = parsed.data;
  const query = id
    ? supabase.from("properties").update(values).eq("id", id).select("id").single()
    : supabase.from("properties").insert(values).select("id").single();
  const { data, error } = await query;

  if (error) {
    if (error.code === "23505") {
      const message = "That URL slug is already used by another property.";
      return { status: "error", message, fieldErrors: { slug: message } };
    }
    console.error("[admin] property save failed", error);
    return { status: "error", message: "Couldn't save the property. Please try again." };
  }

  refreshPublicPages();
  if (!id) redirect(`/admin/properties/${data.id}?created=1`);
  return { status: "success", message: "Saved. The website is updated." };
}

export async function deleteProperty(formData: FormData) {
  const id = z.uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  // Shown by app/admin/error.tsx with a retry button; the message stays server-side.
  if (error) throw new Error("Property delete failed", { cause: error });
  refreshPublicPages();
  redirect("/admin/properties");
}
