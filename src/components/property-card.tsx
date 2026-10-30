import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ShortlistButton } from "./shortlist-button";
import { PROPERTY_TYPE_LABELS, type Property } from "@/lib/types";

export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const cover = property.images[0];
  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {cover && (
          // Same name as the gallery on the project page, so the photo morphs
          // between the two (View Transitions API) whenever both are already
          // loaded: going back to the list, or reopening a project.
          <ViewTransition name={photoTransitionName(property.slug)} share="morph" default="none">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={cover}
                alt={`${property.name}, ${property.city}`}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </ViewTransition>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-3 right-3">
          <ShortlistButton slug={property.slug} name={property.name} />
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy-900 shadow-sm">
            {PROPERTY_TYPE_LABELS[property.type]}
          </span>
          <span className="rounded-full bg-navy-900/85 px-3 py-1 text-xs font-semibold text-white">{property.city}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl leading-snug">
          <Link href={`/properties/${property.slug}`} className="after:absolute after:inset-0">
            {property.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="line-clamp-2">{property.location}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-slate-500">Starting from</p>
            <p className="font-semibold text-brand-700">{property.price_label}</p>
          </div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
            <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

export function photoTransitionName(slug: string) {
  return `property-photo-${slug}`;
}

export function PropertyGrid({ properties, priorityCount = 0 }: { properties: Property[]; priorityCount?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
