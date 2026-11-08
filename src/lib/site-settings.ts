import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

export const SITE_SETTINGS_TAG = "site-settings";

/** Bundled with the site; shown until the admin uploads a video, and if they remove theirs. */
export const DEFAULT_HERO_VIDEO = { src: "/videos/hero.mp4", poster: "/videos/hero-poster.jpg" };

export const heroVideoSchema = z.object({
  src: z.url({ protocol: /^https?$/ }),
  poster: z.url({ protocol: /^https?$/ }),
  /** Storage paths, so the files can be deleted when the video is replaced. */
  srcPath: z.string().min(1).max(200),
  posterPath: z.string().min(1).max(200),
});
export type HeroVideoSetting = z.infer<typeof heroVideoSchema>;

/**
 * The banner video the admin uploaded, or null when they haven't.
 * Never throws: if the database is unreachable the banner falls back to the
 * bundled video rather than taking the home page down with it.
 */
export async function getHeroVideoSetting(): Promise<HeroVideoSetting | null> {
  "use cache";
  cacheTag(SITE_SETTINGS_TAG);
  cacheLife("hours");

  if (!isSupabaseConfigured) return null;
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("value")
    .eq("key", "hero_video")
    .maybeSingle();
  if (error) {
    console.error("[site-settings] hero video load failed", error.message);
    return null;
  }
  const parsed = heroVideoSchema.safeParse(data?.value);
  return parsed.success ? parsed.data : null;
}

export async function getHeroVideo() {
  const setting = await getHeroVideoSetting();
  return setting ? { src: setting.src, poster: setting.poster } : DEFAULT_HERO_VIDEO;
}
