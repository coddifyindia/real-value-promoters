"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * Site-wide feel for mouse and trackpad users: inertial smooth scrolling and a
 * cursor that labels what you're about to open. Touch devices and anyone who
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
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el || !finePointer()) return;
    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let frame = 0;
    document.documentElement.classList.add("has-cursor");

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, select, input, textarea, label, [role=radio]");
      el.dataset.state = labelled ? "label" : interactive ? "hover" : "";
      if (label.current) label.current.textContent = labelled?.dataset.cursor ?? "";
    };
    const leave = () => (el.dataset.state = "hidden");
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div ref={ring} aria-hidden className="cursor-ring">
      <span ref={label} />
    </div>
  );
}
