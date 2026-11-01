import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "./carousel";
import { LinkPending } from "./link-pending";
import { SplitText } from "./motion";
import { ShortlistButton } from "./shortlist-button";
import { PROPERTY_TYPE_LABELS, type Property } from "@/lib/types";

/**
 * Signature projects as a horizontal row the visitor controls: swipe, trackpad,
 * the ← → buttons or arrow keys (see carousel.tsx). Page scrolling is never
 * hijacked to move it sideways.
 */
export function ProjectGallery({ properties, total }: { properties: Property[]; total: number }) {
  return (
    <section aria-labelledby="projects-title" className="relative bg-sand-50">
      <div className="overflow-hidden py-16 sm:py-24">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Signature projects</p>
            <h2 id="projects-title" className="mt-2 text-4xl leading-[1.1] sm:text-6xl sm:leading-[1.08]">
              <SplitText text="Land worth coming home to." />
            </h2>
          </div>
          <Link href="/properties" className="group inline-flex items-center gap-3 text-sm font-semibold text-navy-900">
            <span className="border-b border-navy-900/30 pb-1 transition-colors group-hover:border-navy-900">
              All {total} projects
            </span>
            <span className="inline-flex size-11 items-center justify-center rounded-full border border-navy-900/15 transition group-hover:bg-navy-900 group-hover:text-white">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        </div>

        <Carousel label="Signature projects">
          <ul className="mt-10 flex w-max gap-5 sm:mt-14 px-4 sm:gap-8 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {properties.map((p, i) => (
              <li key={p.id} className="group relative w-[82vw] shrink-0 snap-start sm:w-[54vw] lg:w-[min(34vw,520px)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-navy-900">
                  {p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={`${p.name}, ${p.city}`}
                      fill
                      sizes="(min-width: 1024px) 34vw, (min-width: 640px) 54vw, 82vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
                  <span className="absolute top-5 left-6 font-display text-6xl text-white/90 italic sm:text-7xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute top-5 right-5">
                    <ShortlistButton slug={p.slug} name={p.name} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {PROPERTY_TYPE_LABELS[p.type]} · {p.city}
                    </span>
                    <h3 className="mt-3 text-3xl leading-tight text-white sm:text-4xl">
                      <Link href={`/properties/${p.slug}`} className="after:absolute after:inset-0">
                        {p.name}
                        <LinkPending variant="card" />
                      </Link>
                    </h3>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-white/70">
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span className="line-clamp-1">{p.location}</span>
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-4">
                      <p className="text-white">
                        <span className="block text-xs text-white/60">Starting from</span>
                        <span className="font-semibold text-gold-300">{p.price_label}</span>
                      </p>
                      <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-navy-950 transition-transform duration-500 group-hover:rotate-45">
                        <ArrowUpRight className="size-5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            <li className="relative flex w-[82vw] shrink-0 snap-start sm:w-[54vw] lg:w-[min(28vw,420px)]">
              <Link
                href="/properties"
                className="group flex aspect-[4/5] w-full flex-col justify-between rounded-[1.75rem] border border-navy-900/15 p-8 transition-colors hover:bg-navy-900 hover:text-white"
              >
                <span className="eyebrow group-hover:text-gold-300">Explore</span>
                <span className="font-display text-5xl leading-[1.05] text-navy-900 group-hover:text-white">
                  See all {total} projects
                </span>
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-navy-900 text-white transition group-hover:bg-gold-400 group-hover:text-navy-950">
                  <ArrowRight className="size-6" aria-hidden />
                </span>
              </Link>
            </li>
          </ul>
        </Carousel>
      </div>
    </section>
  );
}
