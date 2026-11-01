import { Building2, Eye, EyeOff, ExternalLink, ImageOff, MapPin, Pencil, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PROPERTY_TYPE_LABELS, type Property } from "@/lib/types";
import { PageHeader, Stat } from "../page-header";
import { SetupNotice } from "../setup-notice";

export const metadata: Metadata = { title: "Properties" };

export default function AdminPropertiesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<TableSkeleton label="Loading properties" />}>
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
    <div className="space-y-8">
      <PageHeader
        title="Properties"
        icon={Building2}
        description="The projects shown on the website. Click one to edit its details, prices and photos, or hide it without deleting."
        meta={
          <>
            <Stat tone="green">{properties.filter((p) => p.published).length} live</Stat>
            <Stat>{properties.filter((p) => !p.published).length} hidden</Stat>
          </>
        }
      >
        <Link href="/admin/properties/new" className="btn-primary">
          <Plus className="size-4" aria-hidden /> Add property
        </Link>
      </PageHeader>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((p) => (
          <li key={p.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-card hover:ring-brand-500">
            <Link href={`/admin/properties/${p.id}`} className="flex flex-1 flex-col">
              <div className="relative flex aspect-[16/9] items-center justify-center bg-slate-100 text-slate-400">
                {!p.images[0] && <ImageOff className="size-8" aria-label="No photo yet" />}
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover" />}
                <span
                  className={`absolute top-3 left-3 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
                    p.published ? "bg-green-600 text-white" : "bg-slate-700 text-white"
                  }`}
                >
                  {p.published ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                  {p.published ? "Live" : "Hidden"}
                </span>
                {p.featured && (
                  <span className="absolute top-3 right-3 inline-flex h-7 items-center gap-1 rounded-full bg-gold-400 px-3 text-xs font-semibold text-navy-950">
                    <Star className="size-3.5 fill-current" aria-hidden /> Featured
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 pb-4">
                <p className="font-display text-xl leading-snug text-navy-900">{p.name}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {PROPERTY_TYPE_LABELS[p.type]} · {p.city}
                </p>
                <p className="mt-auto pt-4 font-semibold text-brand-700">{p.price_label}</p>
              </div>
            </Link>
            {/* Two clear actions per card: edit here, or open the live page in a new tab. */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
              <Link href={`/admin/properties/${p.id}`} className="btn-outline min-h-11 px-4 text-sm">
                <Pencil className="size-4" aria-hidden /> Edit
              </Link>
              {p.published ? (
                <a href={`/properties/${p.slug}`} target="_blank" rel="noopener" className="btn-outline min-h-11 px-4 text-sm">
                  <ExternalLink className="size-4" aria-hidden /> Preview
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-center text-xs text-slate-500" title="Hidden projects aren't on the website. Tick Published to show it.">
                  <EyeOff className="size-4" aria-hidden /> Not on the site
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
