"use client";

import { useActionSubmit } from "@/components/form-meta";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useActionState, useId, useRef, useState } from "react";
import { saveProperty } from "@/app/actions/admin";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { PROPERTY_IMAGES_BUCKET } from "@/lib/supabase/config";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES, type Property } from "@/lib/types";
import type { FormState } from "@/lib/validation";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// Phone photos are often 4–8 MB. Resize in the browser before uploading so
// pages stay fast and storage stays small.
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/webp", 0.82),
  );
}

export function PropertyForm({ property }: { property?: Property }) {
  const [state, action, pending] = useActionState(saveProperty, { status: "idle" } as FormState);
  const onSubmit = useActionSubmit(action);
  const [name, setName] = useState(property?.name ?? "");
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(property));
  const [images, setImages] = useState<string[]>(property?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);
  const id = useId();

  const err = state.fieldErrors ?? {};
  const f = (n: string) => ({ id: `${id}-${n}`, name: n, "aria-invalid": err[n] ? true : undefined });
  const errorFor = (n: string) => (err[n] ? <p className="mt-1 text-sm text-red-600">{err[n]}</p> : null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(undefined);
    const supabase = createBrowserSupabase();
    const folder = slug || "unsorted";
    setUploading(files.length);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const blob = await compress(file);
        const path = `${folder}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from(PROPERTY_IMAGES_BUCKET)
          .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (error) throw error;
        uploaded.push(supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl);
      } catch (e) {
        setUploadError(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
      setUploading((n) => n - 1);
    }
    setImages((prev) => [...prev, ...uploaded]);
    if (fileInput.current) fileInput.current.value = "";
  }

  const move = (i: number, delta: number) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + delta;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {property && <input type="hidden" name="id" value={property.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <section className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:grid-cols-2">
        <h2 className="text-lg sm:col-span-2">Basics</h2>
        <div>
          <label htmlFor={`${id}-name`} className="label">Name</label>
          <input
            {...f("name")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            className="field"
          />
          {errorFor("name")}
        </div>
        <div>
          <label htmlFor={`${id}-slug`} className="label">Web address</label>
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 focus-within:border-brand-500">
            <span className="pl-3 text-sm text-slate-500">/properties/</span>
            <input
              {...f("slug")}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
              className="w-full min-w-0 bg-transparent px-1 py-2.5 text-base focus:outline-none sm:text-sm"
            />
          </div>
          {errorFor("slug")}
        </div>
        <div>
          <label htmlFor={`${id}-location`} className="label">Location / address</label>
          <input {...f("location")} defaultValue={property?.location} required className="field" placeholder="Kalangal, near Sulur" />
          {errorFor("location")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-city`} className="label">City</label>
            <input {...f("city")} defaultValue={property?.city} required className="field" placeholder="Coimbatore" />
            {errorFor("city")}
          </div>
          <div>
            <label htmlFor={`${id}-type`} className="label">Type</label>
            <select {...f("type")} defaultValue={property?.type ?? "plot"} className="field">
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-price_label`} className="label">Price shown on site</label>
          <input {...f("price_label")} defaultValue={property?.price_label} required className="field" placeholder="₹7.75 Lakhs onwards" />
          {errorFor("price_label")}
        </div>
        <div>
          <label htmlFor={`${id}-price_from`} className="label">
            Starting price in ₹ <span className="font-normal text-slate-400">(for sorting; blank if per sq.ft)</span>
          </label>
          <input {...f("price_from")} defaultValue={property?.price_from ?? ""} inputMode="numeric" className="field" placeholder="775000" />
          {errorFor("price_from")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-description`} className="label">Description</label>
          <textarea {...f("description")} defaultValue={property?.description} rows={5} className="field" />
          {errorFor("description")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-amenities`} className="label">
            Amenities <span className="font-normal text-slate-400">(one per line)</span>
          </label>
          <textarea {...f("amenities")} defaultValue={property?.amenities.join("\n")} rows={6} className="field" placeholder={"Gated Community\nCCTV\nChildren's Park"} />
          {errorFor("amenities")}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">Photos</h2>
            <p className="text-sm text-slate-500">The first photo is the cover. Use the arrows to reorder.</p>
          </div>
          <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading > 0} className="btn-outline">
            {uploading > 0 ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
            {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
          </button>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        </div>
        {uploadError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{uploadError}</p>}
        {errorFor("images")}
        {images.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No photos yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {images.map((src, i) => (
              <li key={src} className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image src={src} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-gold-400 px-2 py-0.5 text-xs font-semibold text-navy-950">Cover</span>
                  )}
                </div>
                <div className="flex items-center justify-between bg-white p-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="Move earlier">
                    <ArrowLeft className="size-4" />
                  </button>
                  <button type="button" onClick={() => setImages((p) => [src, ...p.filter((x) => x !== src)])} disabled={i === 0} className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="Make cover">
                    <Star className="size-4" />
                  </button>
                  <button type="button" onClick={() => setImages((p) => p.filter((x) => x !== src))} className="inline-flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Remove photo">
                    <Trash2 className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="Move later">
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:grid-cols-2">
        <h2 className="text-lg sm:col-span-2">Contact &amp; media</h2>
        <div>
          <label htmlFor={`${id}-contact_name`} className="label">Project manager</label>
          <input {...f("contact_name")} defaultValue={property?.contact_name ?? ""} className="field" />
        </div>
        <div>
          <label htmlFor={`${id}-contact_phones`} className="label">
            Phone numbers <span className="font-normal text-slate-400">(comma separated)</span>
          </label>
          <input {...f("contact_phones")} defaultValue={property?.contact_phones.join(", ")} className="field" placeholder="9043934675, 9655669675" />
          {errorFor("contact_phones")}
        </div>
        <div>
          <label htmlFor={`${id}-youtube_id`} className="label">YouTube video link</label>
          <input {...f("youtube_id")} defaultValue={property?.youtube_id ?? ""} className="field" placeholder="https://youtu.be/…" />
          {errorFor("youtube_id")}
        </div>
        <div>
          <label htmlFor={`${id}-instagram_url`} className="label">Instagram reel link</label>
          <input {...f("instagram_url")} defaultValue={property?.instagram_url ?? ""} className="field" placeholder="https://www.instagram.com/reel/…" />
          {errorFor("instagram_url")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-map_embed_url`} className="label">
            Google Maps embed link <span className="font-normal text-slate-400">(Maps → Share → Embed a map → copy the src=&quot;…&quot; URL)</span>
          </label>
          <input {...f("map_embed_url")} defaultValue={property?.map_embed_url ?? ""} className="field" placeholder="https://www.google.com/maps/embed?pb=…" />
          {errorFor("map_embed_url")}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={property?.published ?? true} className="size-4 accent-brand-600" />
          Published (visible on website)
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="featured" defaultChecked={property?.featured ?? false} className="size-4 accent-brand-600" />
          Featured on home page
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          Display order
          <input name="sort_order" type="number" defaultValue={property?.sort_order ?? 100} className="field w-24" />
        </label>
      </section>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button type="submit" disabled={pending || uploading > 0} className="btn-primary">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {property ? "Save changes" : "Create property"}
        </button>
        {state.message && (
          <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-700"}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

export function DeletePropertyButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this property permanently? This cannot be undone.")) e.preventDefault();
      }}
      className="btn mt-3 border border-red-300 bg-white text-red-700 hover:bg-red-100"
    >
      Delete property
    </button>
  );
}
