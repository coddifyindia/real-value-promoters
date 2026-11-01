"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * One IntersectionObserver for the whole page. Elements opt in with
 * data-reveal (word-by-word headings, image wipes); when they scroll into view
 * the observer sets data-shown and CSS does the animation. Pages ship no
 * per-component animation JS, and content is fully visible without JavaScript
 * because the hidden state only applies once <html> has the reveal-ready class.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const root = document.documentElement;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    const watch = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])").forEach((el) => {
        // Already on screen at load: show without animating, so nothing flickers.
        const r = el.getBoundingClientRect();
        if (!root.classList.contains("reveal-ready") && r.top < window.innerHeight && r.bottom > 0) {
          el.dataset.shown = "instant";
        } else {
          io.observe(el);
        }
      });
    };

    watch(document);
    root.classList.add("reveal-ready");

    // Client-side navigations and filtering add new elements.
    const mo = new MutationObserver(() => watch(document));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

/**
 * Pulls a button a few pixels toward the pointer, the "magnetic" CTA effect.
 * Mouse and trackpad only; touch devices and reduced-motion users get a normal button.
 */
export function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (el.style.transform = `translate(${x}px, ${y}px)`));
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <span ref={ref} className="magnetic inline-flex">
      {children}
    </span>
  );
}

/** Splits text into words that rise into place one after another. */
export function SplitText({
  text,
  on = "scroll",
  delay = 0,
  className = "",
  wordClassName = "",
}: {
  text: string;
  /** "load": plays on page load (hero). "scroll": plays when scrolled into view. */
  on?: "load" | "scroll";
  delay?: number;
  className?: string;
  /** Applied to each word, e.g. a gradient fill that must sit on the moving element. */
  wordClassName?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={`split ${className}`} data-split={on} {...(on === "scroll" ? { "data-reveal": "" } : {})}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          // The space sits between the masked boxes: inside an inline-block it would collapse.
          <Fragment key={i}>
            {i > 0 && " "}
            <span className="split-word">
              <span className={wordClassName} style={{ "--w": i + delay } as CSSProperties}>
                {w}
              </span>
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
