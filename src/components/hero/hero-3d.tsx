"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { sceneState } from "./scene-state";

// Three.js is ~150 KB gzipped, so it loads only in the browser, after the page
// is interactive, and never blocks the first paint (the photo hero is the LCP).
const SitePlanScene = dynamic(() => import("./site-plan-scene"), { ssr: false });

function canRender3D() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hosts the 3D model behind the hero copy. `sectionId` is the pinned hero
 * section; its scroll position drives the story on large screens.
 */
export function Hero3D({ sectionId }: { sectionId: string }) {
  const [mode, setMode] = useState<"off" | "lite" | "full">("off");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!canRender3D()) return;
    const start = () => {
      const pinned = matchMedia("(min-width: 1024px)").matches;
      sceneState.autoplay = !pinned;
      setMode(pinned && navigator.hardwareConcurrency >= 4 ? "full" : "lite");
    };
    // Wait until the browser is idle so the hero text and form are interactive first.
    const ric = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 600));
    const id = ric(start, { timeout: 2500 } as IdleRequestOptions);
    return () => (window.cancelIdleCallback ?? clearTimeout)(id as number);
  }, []);

  // Scroll → story progress and chapter. Runs even without WebGL, so the
  // chapter copy still advances over the photo fallback.
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    let frame = 0;
    let chapter = "";

    const update = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      sceneState.progress = p;
      const next = p < 0.3 ? "1" : p < 0.66 ? "2" : "3";
      if (next !== chapter) {
        chapter = next;
        section.dataset.chapter = next;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointer = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // Stop rendering when the hero is off screen: saves battery and GPU.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(section);

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [sectionId]);

  if (mode === "off") return null;
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
      data-testid="hero-3d"
    >
      {/* Kept mounted (re-creating a WebGL context is slow); just stops drawing off screen. */}
      <SitePlanScene lite={mode === "lite"} paused={!visible} onReady={() => setReady(true)} />
    </div>
  );
}
