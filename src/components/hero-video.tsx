"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed, silent, looping background video. The admin changes it at
 * /admin/banner; until then it plays the bundled default.
 *
 * The poster image paints first (it is the page's LCP), and the video only
 * starts once React has hydrated, and only when the visitor hasn't asked for
 * reduced motion or data saving. In those cases the poster stays as a still.
 * Playback pauses while the banner is scrolled out of view.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData) return;

    video.preload = "auto";
    const io = new IntersectionObserver(([e]) => {
      // play() rejects if the browser still blocks autoplay; the poster stays, which is fine.
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="size-full object-cover"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      disablePictureInPicture
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
