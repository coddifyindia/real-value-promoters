import type { NextConfig } from "next";
import seed from "./src/data/seed-properties.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const isDev = process.env.NODE_ENV === "development";
const onVercel = Boolean(process.env.VERCEL);
// Vercel's preview toolbar (comments on preview deployments) loads from vercel.live.
const vercelLive = process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : "";
const supabaseOrigin = supabaseUrl ? ` ${new URL(supabaseUrl).origin}` : "";

/**
 * Content Security Policy: the browser refuses to load anything not listed, so an
 * injected <script src> or an iframe to a look-alike site simply doesn't run.
 * Scripts allow 'unsafe-inline' because Next's static pages inline their data
 * payload; strict nonces would force every page to render per request and lose
 * the prerendered speed. Everything else is locked to the hosts we actually use.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://i.ytimg.com${supabaseOrigin}${vercelLive}`,
  "font-src 'self' data:",
  `connect-src 'self'${supabaseOrigin}${vercelLive}${isDev ? " ws:" : ""}`,
  `frame-src https://www.youtube-nocookie.com https://www.google.com${vercelLive}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(onVercel ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      new URL("https://i.ytimg.com/vi/**"),
      ...(supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : []),
    ],
  },
  // The old site used numeric ids (/properties/1). Keep those links and their search ranking alive.
  async redirects() {
    return seed
      .filter((p) => p.legacy_id != null)
      .map((p) => ({
        source: `/properties/${p.legacy_id}`,
        destination: `/properties/${p.slug}`,
        permanent: true,
      }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // HTTPS only for two years, including subdomains (the site is never served over plain HTTP).
          ...(onVercel ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // Isolates our window from pages it opens (or that open it), blocking tab-nabbing and cross-window leaks.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
          },
        ],
      },
      {
        // Lead data: never cached by browsers or proxies, never indexed.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
