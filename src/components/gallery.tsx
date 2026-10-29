"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const thumbs = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    thumbs.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (!count) return null;

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 sm:aspect-[16/10]" {...swipe}>
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${name} – photo ${index + 1} of ${count}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-cover"
        />
        <NavButtons count={count} go={go} />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <span className="rounded-full bg-navy-950/70 px-3 py-1 text-xs font-medium text-white">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="inline-flex size-9 items-center justify-center rounded-full bg-navy-950/70 text-white hover:bg-navy-950"
            aria-label="View full screen"
          >
            <Expand className="size-4" />
          </button>
        </div>
      </div>

      {count > 1 && (
        <div ref={thumbs} className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              data-index={i}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className="relative aspect-[4/3] w-20 shrink-0 snap-start overflow-hidden rounded-lg opacity-70 ring-2 ring-transparent transition hover:opacity-100 aria-[current=true]:opacity-100 aria-[current=true]:ring-brand-600 sm:w-24"
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          className="fixed inset-0 z-[60] flex flex-col bg-navy-950/95"
          {...swipe}
        >
          <div className="flex items-center justify-between p-3 text-white">
            <span className="text-sm">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Close"
              autoFocus
            >
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              key={`lb-${images[index]}`}
              src={images[index]}
              alt={`${name} – photo ${index + 1} of ${count}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <NavButtons count={count} go={go} dark />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButtons({ count, go, dark = false }: { count: number; go: (delta: number) => void; dark?: boolean }) {
  if (count < 2) return null;
  const tone = dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-white/90 text-navy-900 hover:bg-white";
  return (
    <>
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous photo"
        className={`absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow ${tone}`}
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next photo"
        className={`absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow ${tone}`}
      >
        <ChevronRight className="size-6" />
      </button>
    </>
  );
}
