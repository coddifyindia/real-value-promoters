export const SHORTLIST_MAX = 20;

/** Reads the stored value defensively: anything malformed becomes an empty list. */
export function parseShortlist(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const slugs = value.filter((s): s is string => typeof s === "string" && /^[a-z0-9-]{1,120}$/.test(s));
    return [...new Set(slugs)].slice(0, SHORTLIST_MAX);
  } catch {
    return [];
  }
}

/** Adds the slug (newest first) or removes it if already saved. */
export function toggleSlug(slugs: string[], slug: string): string[] {
  return slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [slug, ...slugs].slice(0, SHORTLIST_MAX);
}
