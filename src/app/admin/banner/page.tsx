import { Clapperboard } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_HERO_VIDEO, heroVideoSchema } from "@/lib/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PageHeader } from "../page-header";
import { SetupNotice } from "../setup-notice";
import { BannerVideoForm } from "./banner-video-form";

export const metadata: Metadata = { title: "Banner video" };

export default function BannerPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<TableSkeleton label="Loading banner video" />}>
      <Banner />
    </Suspense>
  );
}

async function Banner() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", "hero_video").maybeSingle();
  // PGRST205 / 42P01: the site_settings table isn't there, i.e. this deploy's
  // database migration hasn't been applied yet (SUPABASE_DB_URL missing).
  if (error?.code === "PGRST205" || error?.code === "42P01") return <MigrationPending />;
  if (error) throw new Error(error.message);
  const custom = heroVideoSchema.safeParse(data?.value);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Banner video"
        icon={Clapperboard}
        description={
          <>
            The video that plays behind the headline at the top of the home page. It always plays silently on a loop, so
            sound in your file is removed.
          </>
        }
      />
      <BannerVideoForm
        current={custom.success ? { src: custom.data.src, poster: custom.data.poster } : DEFAULT_HERO_VIDEO}
        isCustom={custom.success}
      />
    </div>
  );
}

function MigrationPending() {
  return (
    <div className="max-w-2xl space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h1 className="text-2xl">Banner video: one setup step left</h1>
      <p>
        This page needs a small database update that runs automatically when the website is deployed. It hasn&apos;t run
        yet, usually because the <code className="rounded bg-amber-100 px-1">SUPABASE_DB_URL</code> setting is missing in
        Vercel. Ask your developer to add it and redeploy; the home page keeps showing the default video until then.
      </p>
    </div>
  );
}
