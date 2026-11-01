import { beforeAll, describe, expect, it, vi } from "vitest";

let schema: typeof import("@/lib/property-schema");

beforeAll(async () => {
  // The storage URL allowlist is derived from the project URL at import time.
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
  schema = await import("@/lib/property-schema");
});

const base = {
  name: "Test Acres",
  slug: "test-acres",
  location: "Main Road",
  city: "Coimbatore",
  type: "plot",
  price_label: "₹5 Lakhs",
  price_from: "500000",
  description: "",
  amenities: [],
  images: ["/images/properties/test-acres/01.webp"],
  contact_name: "",
  contact_phones: [],
  youtube_id: "",
  map_embed_url: "",
  instagram_url: "",
  featured: false,
  published: true,
  sort_order: "0",
};

const errorsFor = (overrides: Record<string, unknown>) => {
  const r = schema.propertySchema.safeParse({ ...base, ...overrides });
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe("propertySchema", () => {
  it("accepts a normal property", () => {
    expect(errorsFor({})).toEqual({});
  });

  it("only accepts Google Maps embed links for the map", () => {
    expect(errorsFor({ map_embed_url: "https://www.google.com/maps/embed?pb=abc" })).toEqual({});
    expect(errorsFor({ map_embed_url: "https://evil.example/maps/embed" })).toHaveProperty("map_embed_url");
    expect(errorsFor({ map_embed_url: "https://www.google.com/search?q=x" })).toHaveProperty("map_embed_url");
    expect(errorsFor({ map_embed_url: "http://www.google.com/maps/embed?pb=abc" })).toHaveProperty("map_embed_url");
  });

  it("only accepts instagram.com links", () => {
    expect(errorsFor({ instagram_url: "https://www.instagram.com/reel/abc" })).toEqual({});
    expect(errorsFor({ instagram_url: "https://instagram.com.evil.example/reel" })).toHaveProperty("instagram_url");
  });

  it("only accepts bundled photos or our own storage bucket", () => {
    expect(errorsFor({ images: ["https://abc.supabase.co/storage/v1/object/public/property-images/x/1.webp"] })).toEqual({});
    expect(errorsFor({ images: ["https://tracker.example/pixel.gif"] })).toHaveProperty("images");
    expect(errorsFor({ images: ["javascript:alert(1)"] })).toHaveProperty("images");
    expect(errorsFor({ images: ["https://abc.supabase.co/storage/v1/object/public/property-images/../secret"] })).toHaveProperty("images");
  });

  it("extracts YouTube ids from pasted links", () => {
    const r = schema.propertySchema.parse({ ...base, youtube_id: "https://youtu.be/dQw4w9WgXcQ" });
    expect(r.youtube_id).toBe("dQw4w9WgXcQ");
  });
});

describe("parseJsonArray", () => {
  it("never throws on malformed input", () => {
    expect(schema.parseJsonArray("not json")).toEqual([]);
    expect(schema.parseJsonArray('{"a":1}')).toEqual([]);
    expect(schema.parseJsonArray('["a"]')).toEqual(["a"]);
  });
});
