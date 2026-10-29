"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { PROPERTIES_TAG } from "@/lib/properties";
import { createSessionClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, PROPERTY_TYPES } from "@/lib/types";
import { fieldErrorsOf, type FormState } from "@/lib/validation";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Enter your email and password." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Incorrect email or password." };
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
  if (error) return { status: "error", message: error.message };
  return { status: "success", message: "Saved" };
}

const lines = (v: unknown) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.url().startsWith("https://", "Must start with https://").nullable());

const propertySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  location: z.string().trim().min(2, "Location is required").max(200),
  city: z.string().trim().min(2, "City is required").max(60),
  type: z.enum(PROPERTY_TYPES),
  price_label: z.string().trim().min(1, "Price is required").max(80),
  price_from: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v.replace(/[,\s]/g, "")) : null))
    .pipe(z.number().int().nonnegative("Must be a whole number of rupees").nullable()),
  description: z.string().trim().max(5000),
  amenities: z.array(z.string().max(120)).max(60),
  images: z.array(z.string().min(1)).max(80),
  contact_name: z.string().trim().max(80).transform((v) => v || null),
  contact_phones: z.array(z.string().regex(/^\+?\d{10,15}$/, "Phone numbers must be 10–15 digits")).max(5),
  youtube_id: z
    .string()
    .trim()
    .transform((v) => v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? v)
    .pipe(z.union([z.literal(""), z.string().regex(/^[\w-]{11}$/, "Paste a YouTube link or video id")]))
    .transform((v) => v || null),
  map_embed_url: optionalUrl,
  instagram_url: optionalUrl,
  featured: z.boolean(),
  published: z.boolean(),
  sort_order: z.coerce.number().int(),
});

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
    images: JSON.parse(String(raw.images ?? "[]")),
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
    const message = error.code === "23505" ? "That URL slug is already used by another property." : error.message;
    return { status: "error", message, fieldErrors: error.code === "23505" ? { slug: message } : undefined };
  }

  refreshPublicPages();
  if (!id) redirect(`/admin/properties/${data.id}?created=1`);
  return { status: "success", message: "Saved. The website is updated." };
}

export async function deleteProperty(formData: FormData) {
  const id = z.uuid().parse(formData.get("id"));
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refreshPublicPages();
  redirect("/admin/properties");
}
