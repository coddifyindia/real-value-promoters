import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import seed from "@/data/seed-properties.json";
import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/public";
import type { Property } from "./types";

export const PROPERTIES_TAG = "properties";

const COLUMNS =
  "id, legacy_id, slug, name, location, city, type, price_label, price_from, description, amenities, images, contact_name, contact_phones, youtube_id, map_embed_url, instagram_url, featured, published, sort_order, updated_at";

// Without Supabase credentials (local preview, first deploy) the site renders
// from the bundled seed data, so it never builds an empty catalogue.
function seedProperties(): Property[] {
  return (seed as Omit<Property, "id" | "updated_at">[]).map((p) => ({
    ...p,
    id: `seed-${p.slug}`,
    updated_at: "2026-10-29T00:00:00Z",
  }));
}

export async function getPublishedProperties(): Promise<Property[]> {
  "use cache";
  cacheTag(PROPERTIES_TAG);
  cacheLife("hours");

  if (!isSupabaseConfigured) return seedProperties();

  const { data, error } = await createPublicClient()
    .from("properties")
    .select(COLUMNS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load properties: ${error.message}`);
  return data as Property[];
}

export async function getPropertyBySlug(slug: string) {
  const all = await getPublishedProperties();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPropertyByLegacyId(id: number) {
  const all = await getPublishedProperties();
  return all.find((p) => p.legacy_id === id) ?? null;
}

export function getCities(properties: Property[]) {
  return [...new Set(properties.map((p) => p.city))].sort();
}
