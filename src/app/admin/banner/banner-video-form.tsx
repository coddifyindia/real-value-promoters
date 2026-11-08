"use client";

import { CircleAlert, CircleCheck, Clapperboard, Loader2, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { resetHeroVideo, saveHeroVideo } from "@/app/actions/admin";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { SITE_MEDIA_BUCKET } from "@/lib/supabase/config";

type Ready = { video: Blob; poster: Blob; previewUrl: string; originalSize: number; name: string };
type Step =
  | { kind: "idle" }
  | { kind: "compressing"; progress: number; name: string }
  | { kind: "ready"; ready: Ready }
  | { kind: "publishing"; ready: Ready }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;

export function BannerVideoForm({ current, isCustom }: { current: { src: string; poster: string }; isCustom: boolean }) {
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [resetting, startReset] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const busy = step.kind === "compressing" || step.kind === "publishing" || resetting;

  const previewUrl = step.kind === "ready" || step.kind === "publishing" ? step.ready.previewUrl : undefined;
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  // Leaving mid-way would lose the work; ask first.
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [busy]);

  async function choose(file: File | undefined) {
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    setStep({ kind: "compressing", progress: 0, name: file.name });
    try {
      // Loaded on demand: the encoder library is only needed on this page, only now.
      const { compressVideo, capturePoster } = await import("./compress-video");
      const video = await compressVideo(file, (progress) => setStep({ kind: "compressing", progress, name: file.name }));
      const poster = await capturePoster(video);
      setStep({
        kind: "ready",
        ready: { video, poster, previewUrl: URL.createObjectURL(video), originalSize: file.size, name: file.name },
      });
    } catch (e) {
      console.error("[banner] prepare failed", e);
      // VideoError messages are written for the admin; anything else is unexpected.
      const message = e instanceof Error && e.name === "VideoError" ? e.message : "Couldn't prepare that video. Please try another file.";
      setStep({ kind: "error", message });
    }
  }

  async function publish(ready: Ready) {
    setStep({ kind: "publishing", ready });
    const storage = createBrowserSupabase().storage.from(SITE_MEDIA_BUCKET);
    const srcPath = `hero/${crypto.randomUUID()}.mp4`;
    const posterPath = `hero/${crypto.randomUUID()}.webp`;
    // Each upload gets a new name, so browsers and the CDN can cache it for a year.
    const opts = { cacheControl: "31536000", upsert: false };
    const [v, p] = await Promise.all([
      storage.upload(srcPath, ready.video, { ...opts, contentType: "video/mp4" }),
      storage.upload(posterPath, ready.poster, { ...opts, contentType: "image/webp" }),
    ]);
    if (v.error || p.error) {
      console.error("[banner] upload failed", v.error ?? p.error);
      await storage.remove([srcPath, posterPath]).catch(() => {});
      setStep({ kind: "error", message: "The upload didn't go through. Check your connection and try again." });
      return;
    }
    const result = await saveHeroVideo({ srcPath, posterPath });
    if (result.status !== "success") {
      await storage.remove([srcPath, posterPath]).catch(() => {});
      setStep({ kind: "error", message: result.message ?? "Couldn't save the video." });
      return;
    }
    setStep({ kind: "done", message: result.message ?? "Saved." });
  }

  function reset() {
    if (!confirm("Remove your video and go back to the default banner video?")) return;
    startReset(async () => {
      const result = await resetHeroVideo();
      setStep(result.status === "success" ? { kind: "done", message: result.message ?? "Removed." } : { kind: "error", message: result.message ?? "Couldn't remove the video." });
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <section aria-labelledby="banner-preview" className="space-y-3">
        <h2 id="banner-preview" className="text-lg font-semibold text-navy-900">
          {step.kind === "ready" || step.kind === "publishing" ? "Preview of your new video" : isCustom ? "Your video, live now" : "Default video, live now"}
        </h2>
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-950 shadow-sm ring-1 ring-slate-200">
          {step.kind === "compressing" ? (
            <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
              <Loader2 className="size-8 animate-spin text-gold-300" aria-hidden />
              <p className="font-medium">Compressing “{step.name}”…</p>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gold-400 transition-[width]" style={{ width: `${Math.round(step.progress * 100)}%` }} />
              </div>
              <p className="text-sm text-white/70" aria-live="polite">
                {Math.round(step.progress * 100)}% · keep this tab open
              </p>
            </div>
          ) : (
            <video
              key={previewUrl ?? current.src}
              src={previewUrl ?? current.src}
              poster={previewUrl ? undefined : current.poster}
              className="size-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              controls={false}
            />
          )}
        </div>
        {(step.kind === "ready" || step.kind === "publishing") && (
          <p className="text-sm text-slate-600">
            Compressed from {mb(step.ready.originalSize)} to <strong className="text-navy-900">{mb(step.ready.video.size)}</strong>,
            so it loads fast on phones.
          </p>
        )}
      </section>

      <section aria-label="Change the video" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        {step.kind === "ready" || step.kind === "publishing" ? (
          <>
            <p className="text-sm text-slate-600">Happy with the preview? Publishing puts it on the home page straight away.</p>
            <button type="button" onClick={() => publish(step.ready)} disabled={busy} className="btn-primary btn-lg w-full">
              {step.kind === "publishing" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Upload className="size-5" aria-hidden />}
              {step.kind === "publishing" ? "Publishing…" : "Publish to home page"}
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className="btn-outline w-full">
              Choose a different video
            </button>
          </>
        ) : (
          <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className="btn-primary btn-lg w-full">
            {step.kind === "compressing" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Clapperboard className="size-5" aria-hidden />}
            {step.kind === "compressing" ? "Compressing…" : isCustom ? "Replace video" : "Upload a video"}
          </button>
        )}
        <input ref={fileInput} type="file" accept="video/*" hidden onChange={(e) => choose(e.target.files?.[0])} />

        {step.kind === "done" && (
          <p className="flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            {step.message}
          </p>
        )}
        {step.kind === "error" && (
          <p className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {step.message}
          </p>
        )}

        <div className="space-y-2 border-t border-slate-200 pt-5 text-sm text-slate-600">
          <p className="font-medium text-navy-900">What works best</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Landscape (sideways) video. Phones crop the sides, so keep the subject in the middle.</li>
            <li>10–30 seconds. Only the first 30 seconds are used.</li>
            <li>Any file from a phone or camera is fine: it is compressed here before uploading.</li>
            <li>Calm, slow footage reads best behind the headline.</li>
          </ul>
        </div>

        {isCustom && step.kind !== "ready" && step.kind !== "publishing" && (
          <button type="button" onClick={reset} disabled={busy} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-700 disabled:opacity-50">
            {resetting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
            Go back to the default video
          </button>
        )}
      </section>
    </div>
  );
}
