"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { PropertyGrid } from "./property-card";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES, type Property, type PropertyType } from "@/lib/types";

const SORTS = {
  featured: "Recommended",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
} as const;
type Sort = keyof typeof SORTS;

export function PropertyExplorer({ properties, cities }: { properties: Property[]; cities: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const city = params.get("city") ?? "";
  const type = (params.get("type") ?? "") as PropertyType | "";
  const sort = (params.get("sort") ?? "featured") as Sort;
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const filtered = properties.filter(
      (p) =>
        (!city || p.city === city) &&
        (!type || p.type === type || (p.type === "plot_villa" && (type === "plot" || type === "villa"))) &&
        (!q || `${p.name} ${p.location} ${p.city} ${p.amenities.join(" ")}`.toLowerCase().includes(q)),
    );
    if (sort === "featured") return filtered;
    // Per-sq.ft / per-cent prices have no comparable total, so they sort last.
    const dir = sort === "price_asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (a.price_from == null) return 1;
      if (b.price_from == null) return -1;
      return (a.price_from - b.price_from) * dir;
    });
  }, [properties, city, type, sort, deferredQuery]);

  const hasFilters = Boolean(city || type || query);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 mb-8 border-b border-slate-200 bg-sand-50/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:px-4 sm:shadow-card md:top-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search properties</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => update("q", query.trim())}
              placeholder="Search by name, area or amenity"
              className="field pl-10"
            />
          </label>
          <label>
            <span className="sr-only">City</span>
            <select value={city} onChange={(e) => update("city", e.target.value)} className="field lg:w-44">
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Property type</span>
            <select value={type} onChange={(e) => update("type", e.target.value)} className="field lg:w-40">
              <option value="">All types</option>
              {PROPERTY_TYPES.filter((t) => t !== "plot_villa").map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Sort by</span>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <select value={sort} onChange={(e) => update("sort", e.target.value === "featured" ? "" : e.target.value)} className="field pl-10 lg:w-52">
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600" aria-live="polite">
          Showing <strong className="text-navy-900">{results.length}</strong> of {properties.length} projects
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.replace(pathname, { scroll: false });
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
          >
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <PropertyGrid properties={results} priorityCount={3} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-display text-xl text-navy-900">No projects match those filters</p>
          <p className="mt-2 text-sm text-slate-600">Try another city or type, or tell us what you&apos;re looking for.</p>
        </div>
      )}
    </div>
  );
}
