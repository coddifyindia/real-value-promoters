"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * Site-wide feel for mouse and trackpad users: inertial smooth scrolling.
 * Touch devices and anyone who prefers reduced motion get the browser's
 * native behaviour.
 */
export function Experience() {
  return (
    <Suspense fallback={null}>
      <SmoothScroll />
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
