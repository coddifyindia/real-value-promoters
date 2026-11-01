"use client";

import { useEffect, useRef } from "react";

// Drawing space for the wordmark (SVG user units).
const W = 1200;
const H = 280;
const BASE = 240; // baseline

/**
 * The footer's "Real Value" wordmark, built like a building when it scrolls
 * into view: the letters fill with brick courses, floor by floor, while a thin
 * gold level line rides the top of the work and fades once it tops out.
 *
 * Pure SVG + CSS (see .wm-* in globals.css); this component only flips
 * data-built when the wordmark is on screen. With reduced motion the finished
 * wordmark shows straight away.
 */
export function ConstructionWordmark() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.built = "";
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const text = (
    <text
      x={W / 2}
      y={BASE}
      textAnchor="middle"
      fontSize={226}
      fontWeight={600}
      textLength={W - 40}
      lengthAdjust="spacingAndGlyphs"
      style={{ fontFamily: "var(--font-display)" }}
    >
      Real Value
    </text>
  );

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="wordmark block h-auto w-full" aria-hidden focusable="false">
      <defs>
        {/* Brick courses in stretcher bond: joints offset every other course. */}
        <pattern id="wm-bricks" width="64" height="28" patternUnits="userSpaceOnUse">
          <rect width="64" height="28" fill="#dcab52" />
          <path d="M0 13.5H64M0 27.5H64M31.5 0V13.5M0.5 14V28M63.5 14V28" stroke="#071427" strokeOpacity="0.35" strokeWidth="1.5" />
        </pattern>
        <clipPath id="wm-rise">
          <rect className="wm-rise" x="0" y="0" width={W} height={H} />
        </clipPath>
      </defs>

      {/* The outline is there from the start, like the plan before the build. */}
      <g fill="none" stroke="#e8c27a" strokeOpacity="0.3" strokeWidth="1.25">
        {text}
      </g>
      <g clipPath="url(#wm-rise)" fill="url(#wm-bricks)">
        {text}
      </g>
      <line className="wm-level" x1={0} x2={W} y1={0} y2={0} stroke="#dcab52" strokeWidth="1.5" />
    </svg>
  );
}
