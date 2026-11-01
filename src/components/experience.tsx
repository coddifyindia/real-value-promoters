"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * Site-wide feel for mouse and trackpad users: inertial smooth scrolling and a
 * small label next to the pointer naming what you're about to open. Touch devices and anyone who
 * prefers reduced motion get the browser's native behaviour.
 */
export function Experience() {
  return (
    <Suspense fallback={null}>
      <SmoothScroll />
      <Cursor />
    </Suspense>
  );
}

const finePointer = () =>
  typeof window !== "undefined" && matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;

function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!finePointer()) return;
    // Lenis animates the real window scroll position, so sticky sections and CSS
    // scroll-driven animations keep working; it only smooths the input.
    const l = new Lenis({ lerp: 0.11, anchors: { offset: -96 }, autoRaf: true });
    lenis.current = l;
    return () => {
      l.destroy();
      lenis.current = null;
    };
  }, []);

  // New page: start at the top immediately rather than gliding up from the old position.
  useEffect(() => {
    if (!window.location.hash) lenis.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}

function Cursor() {
  const tag = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = tag.current;
    if (!el || !finePointer()) return;
    let x = -200;
    let y = -200;
    let tx = -200;
    let ty = -200;
    let frame = 0;
    document.documentElement.classList.add("has-cursor");

    // Follows closely (not a floaty trail), so it reads as part of the pointer.
    const loop = () => {
      x += (tx - x) * 0.45;
      y += (ty - y) * 0.45;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const labelled = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        if (text.current) text.current.textContent = labelled.dataset.cursor ?? "";
        el.dataset.on = "";
      } else delete el.dataset.on;
    };
    const leave = () => delete el.dataset.on;

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={tag} aria-hidden className="cursor-tag">
      <span ref={text} />
    </div>
  );
}
