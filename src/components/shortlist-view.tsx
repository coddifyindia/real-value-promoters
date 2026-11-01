"use client";

import { Heart, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { LeadForm } from "./lead-form";
import { WhatsAppIcon } from "./icons";
import { PropertyGrid } from "./property-card";
import { useShortlist } from "@/lib/shortlist";
import { site, whatsappLink } from "@/lib/site";
import { PROPERTY_TYPE_LABELS, type Property } from "@/lib/types";

export function ShortlistView({ properties }: { properties: Property[] }) {
  const { slugs, clear } = useShortlist();
  // Keep the visitor's saved order; skip projects that were unpublished since.
  const saved = slugs.map((s) => properties.find((p) => p.slug === s)).filter((p): p is Property => Boolean(p));

  if (!saved.length) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Heart className="size-7" aria-hidden />
        </span>
        <p className="mt-4 font-display text-xl text-navy-900">Nothing saved yet</p>
        <p className="mt-2 text-sm text-slate-600">Tap the heart on any project to save it here and compare later.</p>
        <Link href="/properties" className="btn-primary mt-6">
          Browse projects
        </Link>
      </div>
    );
  }

  const names = saved.map((p) => p.name).join(", ");
  const shareText = `My shortlist from ${site.name}:\n${saved.map((p) => `• ${p.name} (${p.city}), ${site.url}/properties/${p.slug}`).join("\n")}`;

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <strong className="text-navy-900">{saved.length}</strong> saved {saved.length === 1 ? "project" : "projects"}
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <Share2 className="size-4" aria-hidden /> Share with family
          </a>
          <button type="button" onClick={clear} className="btn-outline text-red-600 hover:border-red-600">
            <Trash2 className="size-4" aria-hidden /> Clear all
          </button>
        </div>
      </div>

      <PropertyGrid properties={saved} />

      {saved.length > 1 && (
        <section aria-labelledby="compare-title">
          <h2 id="compare-title" className="text-2xl">
            Compare at a glance
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-sand-100 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Project</th>
                  <th scope="col" className="px-4 py-3 font-semibold">City</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Starting price</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Amenities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saved.map((p) => (
                  <tr key={p.slug}>
                    <th scope="row" className="px-4 py-3 font-semibold text-navy-900">
                      <Link href={`/properties/${p.slug}`} className="hover:text-brand-700 hover:underline">
                        {p.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-slate-700">{p.city}</td>
                    <td className="px-4 py-3 text-slate-700">{PROPERTY_TYPE_LABELS[p.type]}</td>
                    <td className="px-4 py-3 font-semibold text-brand-700">{p.price_label}</td>
                    <td className="px-4 py-3 text-slate-700">{p.amenities.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section id="enquire" className="grid gap-8 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 sm:p-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl">Ask about all of them at once</h2>
          <p className="mt-2 text-slate-600">
            We&apos;ll send price lists and available plots for every project on your list, and can plan one trip to see
            them together.
          </p>
          <a
            href={whatsappLink(`Hi, I'd like details on these projects: ${names}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-6"
          >
            <WhatsAppIcon className="size-5" /> Ask on WhatsApp
          </a>
        </div>
        {/* key: the prefilled message is uncontrolled, so remount when the list changes. */}
        <LeadForm key={names} defaultMessage={`I'm interested in: ${names}.`} />
      </section>
    </div>
  );
}
