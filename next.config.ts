import type { NextConfig } from "next";
import seed from "./src/data/seed-properties.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
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
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
