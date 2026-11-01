"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type City = { city: string; count: number; image?: string };

/**
 * Cities as a large-type index. With a mouse, a photo of the city's projects
 * follows the cursor over the list; on touch screens each row shows a thumbnail.
 */
export function CityIndex({ cities }: { cities: City[] }) {
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = list.current;
    const box = preview.current;
    if (!el || !box || !matchMedia("(pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    // Eased follow: the preview trails the cursor slightly, which reads as weight.
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      box.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${(tx - x) * 0.04}deg)`;
      frame = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    el.addEventListener("pointermove", move);
    frame = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative">
      <ul ref={list} className="relative border-t border-navy-900/15" onPointerLeave={() => setActive(null)}>
        {cities.map((c, i) => (
          <li key={c.city} className="border-b border-navy-900/15">
            <Link
              href={`/properties?city=${encodeURIComponent(c.city)}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              data-cursor="Explore"
              className="group flex items-center gap-4 py-5 transition-colors sm:gap-8 sm:py-7"
            >
              <span className="w-8 font-display text-sm text-slate-500 italic sm:w-12 sm:text-base">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-display text-4xl leading-none text-navy-900 transition-[translate,color] duration-500 group-hover:translate-x-3 group-hover:text-brand-700 sm:text-6xl lg:text-7xl">
                {c.city}
              </span>
              <span className="hidden text-sm text-slate-600 sm:block">
                {c.count} {c.count === 1 ? "project" : "projects"}
              </span>
              {c.image && (
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl pointer-fine:hidden">
                  <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
              )}
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 transition duration-500 group-hover:rotate-45 group-hover:border-navy-900 group-hover:bg-navy-900 group-hover:text-white">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
        {/* Cursor-following preview (mouse only) */}
        <div
          ref={preview}
          aria-hidden
          className={`pointer-events-none absolute top-0 left-0 z-10 hidden aspect-[4/5] w-64 overflow-hidden rounded-2xl shadow-2xl transition-[opacity,scale] duration-500 ease-out pointer-fine:block ${
            active === null ? "scale-75 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {cities.map((c, i) =>
            c.image ? (
              <Image
                key={c.city}
                src={c.image}
                alt=""
                fill
                sizes="256px"
                className={`object-cover transition-[opacity,scale] duration-700 ${active === i ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
              />
            ) : null,
          )}
        </div>
      </ul>
    </div>
  );
}
