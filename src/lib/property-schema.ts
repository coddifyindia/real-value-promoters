import { z } from "zod";
import { PROPERTY_IMAGES_BUCKET, supabaseUrl } from "./supabase/config";
import { PROPERTY_TYPES } from "./types";

// Validation for the admin property editor. Kept outside the "use server" file
// so it can be unit tested.

export const lines = (v: unknown) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

// Admin-entered URLs end up in iframes, links and <img> tags on the public site,
// so only accept the hosts each field is meant for. A stolen admin password then
// can't be used to embed a phishing page or a tracking pixel.
const optionalUrlOn = (hosts: string[], label: string) =>
  z
    .string()
    .trim()
    .transform((v) => v || null)
    .pipe(
      z
        .url()
        .refine((v) => {
          const u = new URL(v);
          return u.protocol === "https:" && hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
        }, `Use a ${label} link`)
        .nullable(),
    );

const storagePrefix = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/` : null;
const imageSrc = z
  .string()
  .max(500)
  .refine(
    (v) => /^\/images\/properties\/[\w-]+\/[\w.-]+$/.test(v) || (storagePrefix !== null && v.startsWith(storagePrefix) && !v.includes("..")),
    "Photos must be uploaded here",
  );

export function parseJsonArray(v: unknown): unknown[] {
  try {
    const parsed: unknown = JSON.parse(String(v ?? "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const propertySchema = z.object({
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
  images: z.array(imageSrc).max(80),
  contact_name: z.string().trim().max(80).transform((v) => v || null),
  contact_phones: z.array(z.string().regex(/^\+?\d{10,15}$/, "Phone numbers must be 10–15 digits")).max(5),
  youtube_id: z
    .string()
    .trim()
    .transform((v) => v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? v)
    .pipe(z.union([z.literal(""), z.string().regex(/^[\w-]{11}$/, "Paste a YouTube link or video id")]))
    .transform((v) => v || null),
  map_embed_url: optionalUrlOn(["google.com"], "Google Maps embed").refine(
    (v) => v === null || new URL(v).pathname.startsWith("/maps/embed"),
    "Use the Google Maps “Embed a map” link",
  ),
  instagram_url: optionalUrlOn(["instagram.com"], "instagram.com"),
  featured: z.boolean(),
  published: z.boolean(),
  sort_order: z.coerce.number().int(),
});

