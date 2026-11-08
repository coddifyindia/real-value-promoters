import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
} from "mediabunny";

/** The banner loops, so anything past this is never worth downloading. */
export const MAX_SECONDS = 30;
const LONG_EDGE = 1280;
// ~1.5 Mbit/s: a 20-second banner comes out around 3–4 MB. The banner is
// darkened under text, so more bitrate buys detail nobody sees.
const BITRATE = 1_500_000;

/** A problem with the file itself, worded for the admin. */
export class VideoError extends Error {
  override name = "VideoError";
}

/**
 * Re-encodes any video the browser can decode into the file the home page
 * plays: H.264 MP4 (plays everywhere), no audio (the banner is always muted,
 * so sound is dead weight), long edge 1280px, 25 fps, first 30 seconds, with
 * the index at the front so playback starts before the download finishes.
 *
 * Runs entirely on the admin's device using the browser's built-in video
 * encoder (WebCodecs). Phone videos of 50–200 MB come out at a few MB, which
 * protects visitors' mobile data and the storage bandwidth quota.
 */
export async function compressVideo(file: File, onProgress: (fraction: number) => void): Promise<Blob> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });

  let track;
  let duration;
  try {
    track = await input.getPrimaryVideoTrack();
    duration = await input.computeDuration();
  } catch {
    throw new VideoError("This file isn't a video we can read. Try exporting it as an MP4.");
  }
  if (!track) throw new VideoError("This file has no video in it.");

  const landscape = track.displayWidth >= track.displayHeight;
  const size = landscape
    ? { width: Math.min(LONG_EDGE, track.displayWidth) }
    : { height: Math.min(LONG_EDGE, track.displayHeight) };

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const conversion = await Conversion.init({
    input,
    output,
    video: { codec: "avc", ...size, frameRate: 25, quality: new Quality({ bitrate: BITRATE, bitrateMode: "variable" }), keyFrameInterval: 2, forceTranscode: true },
    audio: { discard: true },
    trim: { start: 0, end: Math.min(duration, MAX_SECONDS) },
  });
  if (!conversion.isValid) {
    const reasons = conversion.discardedTracks.filter((t) => t.track.type === "video").map((t) => t.reason);
    console.error("[banner] conversion not possible", reasons);
    throw new VideoError(
      reasons.includes("no_encodable_target_codec")
        ? "This browser can't compress video. Please use the latest Chrome, Edge or Safari."
        : "This browser can't read this video's format. Try exporting it as an MP4 (H.264) and uploading that.",
    );
  }
  conversion.onProgress = onProgress;
  try {
    await conversion.execute();
  } catch (e) {
    console.error("[banner] compression failed", e);
    throw new VideoError("Compressing the video failed part-way. Try again, or export it as an MP4 first.");
  }
  return new Blob([output.target.buffer!], { type: "video/mp4" });
}

/** A still from the compressed video, shown while the banner loads and to visitors who prefer reduced motion. */
export async function capturePoster(video: Blob): Promise<Blob> {
  const url = URL.createObjectURL(video);
  try {
    const el = document.createElement("video");
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";
    el.src = url;
    await new Promise<void>((resolve, reject) => {
      el.onloadeddata = () => resolve();
      el.onerror = () => reject(new VideoError("Couldn't read the compressed video."));
    });
    // Not frame 0: many clips open on black or a fade-in.
    el.currentTime = Math.min(0.5, el.duration / 2);
    await new Promise<void>((resolve) => (el.onseeked = () => resolve()));

    const canvas = document.createElement("canvas");
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    canvas.getContext("2d")!.drawImage(el, 0, 0);
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new VideoError("Couldn't make the preview image."))), "image/webp", 0.8),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
