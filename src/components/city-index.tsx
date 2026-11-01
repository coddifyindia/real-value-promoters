import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type City = { city: string; count: number; image?: string };

/**
 * Cities as a large-type index. Each row is one big tap target with an
 * explicit "View N projects" button, so it's obvious what happens on click.
 * With a mouse, hovering a row slides a photo of that city's projects open
 * inline, beside the name (it never covers the list). Touch screens show the
 * photo as a thumbnail all the time.
 */
export function CityIndex({ cities }: { cities: City[] }) {
  return (
    <ul className="border-t border-navy-900/15">
      {cities.map((c, i) => (
        <li key={c.city} className="border-b border-navy-900/15">
          <Link
            href={`/properties?city=${encodeURIComponent(c.city)}`}
            className="group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-5 transition-colors duration-300 hover:bg-sand-50 focus-visible:bg-sand-50 sm:-mx-5 sm:gap-6 sm:px-5 sm:py-6"
          >
            <span className="w-7 shrink-0 font-sans text-sm font-semibold text-gold-700 tabular-nums sm:w-9 sm:text-base">
              {String(i + 1).padStart(2, "0")}
            </span>

            {c.image && (
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20 pointer-fine:h-20 pointer-fine:w-0 pointer-fine:opacity-0 pointer-fine:transition-[width,opacity] pointer-fine:duration-500 pointer-fine:ease-[cubic-bezier(0.2,0.75,0.15,1)] pointer-fine:group-hover:w-32 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:w-32 pointer-fine:group-focus-visible:opacity-100">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </span>
            )}

            <span className="min-w-0 flex-1">
              <span className="block font-display text-[2.5rem] leading-[1.1] text-navy-900 transition-colors duration-300 group-hover:text-brand-700 sm:text-6xl">
                {c.city}
              </span>
              <span className="mt-1 block text-sm text-slate-600 sm:hidden">
                {c.count} {c.count === 1 ? "project" : "projects"}
              </span>
            </span>

            <span className="hidden h-12 shrink-0 items-center gap-2 rounded-full border border-navy-900/15 pr-2 pl-5 text-sm font-semibold text-navy-900 transition-colors duration-300 group-hover:border-navy-900 group-hover:bg-navy-900 group-hover:text-white sm:inline-flex">
              View {c.count} {c.count === 1 ? "project" : "projects"}
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-gold-400 text-navy-950 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </span>
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white sm:hidden">
              <ArrowRight className="size-5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
