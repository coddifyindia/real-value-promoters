import { Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PROPERTY_TYPE_LABELS, type Property } from "@/lib/types";
import { SetupNotice } from "../setup-notice";

export const metadata: Metadata = { title: "Properties" };

export default function AdminPropertiesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      <PropertyList />
    </Suspense>
  );
}

async function PropertyList() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("properties")
    .select("id, slug, name, city, type, price_label, images, featured, published, sort_order")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const properties = (data ?? []) as Pick<
    Property,
    "id" | "slug" | "name" | "city" | "type" | "price_label" | "images" | "featured" | "published" | "sort_order"
  >[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Properties</h1>
          <p className="mt-1 text-sm text-slate-600">
            {properties.filter((p) => p.published).length} live · {properties.filter((p) => !p.published).length} hidden
          </p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary">
          <Plus className="size-4" aria-hidden /> Add property
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/properties/${p.id}`}
              className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 transition hover:ring-brand-500"
            >
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate font-semibold text-navy-900">
                  {p.featured && <Star className="size-4 shrink-0 fill-gold-400 text-gold-400" aria-label="Featured" />}
                  {p.name}
                </p>
                <p className="text-sm text-slate-500">
                  {PROPERTY_TYPE_LABELS[p.type]} · {p.city}
                </p>
                <p className="text-sm text-brand-700">{p.price_label}</p>
                {!p.published && (
                  <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">Hidden</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
