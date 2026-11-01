"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

/**
 * A horizontal row you control yourself: swipe or trackpad-scroll it, use the
 * ← → buttons, or focus it and use the arrow keys. It snaps to each card, and a
 * progress bar shows where you are. Nothing is tied to the page's vertical
 * scroll, so scrolling down the page always just scrolls the page.
 */
export function Carousel({
  label,
  children,
  controlsSlot,
}: {
  label: string;
  children: ReactNode;
  /** Rendered next to the buttons (e.g. an "All projects" link). */
  controlsSlot?: ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ atStart: true, atEnd: false, thumb: 1, offset: 0 });

  const measure = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const thumb = el.scrollWidth ? el.clientWidth / el.scrollWidth : 1;
    setState({
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft >= max - 4,
      thumb,
      offset: max > 0 ? (el.scrollLeft / max) * (1 - thumb) : 0,
    });
  }, []);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = viewport.current;
    const card = el?.querySelector<HTMLElement>(":scope > ul > li");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(card.parentElement!).columnGap) || 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  };

  const button =
    "inline-flex size-12 items-center justify-center rounded-full border border-navy-900/20 bg-white text-navy-900 shadow-sm transition hover:border-navy-900 hover:bg-navy-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-navy-900/20 disabled:hover:bg-white disabled:hover:text-navy-900";

  return (
    <div>
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        // Smooth scrolling (Lenis) would otherwise swallow sideways trackpad
        // swipes; this hands horizontal gestures to the browser.
        data-lenis-prevent-horizontal
        className="carousel-viewport focus-visible:outline-offset-[-4px]"
      >
        {children}
      </div>
      <div className="container-x mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex gap-3">
          <button type="button" className={button} onClick={() => step(-1)} disabled={state.atStart} aria-label="Previous projects">
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <button type="button" className={button} onClick={() => step(1)} disabled={state.atEnd} aria-label="Next projects">
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
        <div aria-hidden className="relative h-1 min-w-32 flex-1 overflow-hidden rounded-full bg-navy-900/10">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-gold-500 transition-[transform,width] duration-300 ease-out"
            style={{ width: `${state.thumb * 100}%`, transform: `translateX(${(state.offset / state.thumb) * 100}%)` }}
          />
        </div>
        {controlsSlot}
      </div>
    </div>
  );
}
