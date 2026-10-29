import type { MetadataRoute } from "next";
import { getPublishedProperties } from "@/lib/properties";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublishedProperties();
  const pages = ["", "/properties", "/services", "/about", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...properties.map((p) => ({
      url: `${site.url}/properties/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: p.images.slice(0, 5).map((src) => (src.startsWith("http") ? src : `${site.url}${src}`)),
    })),
  ];
}
