"use client";

import { CloudOff, Home, Loader2, Phone, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useTransition } from "react";
import { WhatsAppIcon } from "./icons";
import { site, whatsappLink } from "@/lib/site";

/**
 * Shared fallback for error boundaries. The visitor always gets a way forward:
 * retry, go home, or reach the sales team directly, so an outage never costs a lead.
 */
export function ErrorState({
  error,
  retry,
  title = "This page didn't load",
  message = "Something went wrong on our side while loading this page. Please try again in a moment.",
  compact = false,
}: {
  error: unknown;
  retry: () => void;
  title?: string;
  message?: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  // Server errors arrive with a digest that matches the server log entry.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className={`enter container-x flex flex-col items-center text-center ${compact ? "py-12" : "py-20 sm:py-28"}`}
    >
      <span className="relative inline-flex size-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/20 [animation-duration:2.4s]" aria-hidden />
        <span className="relative inline-flex size-20 items-center justify-center rounded-full bg-gold-100 text-gold-700">
          <CloudOff className="size-9" aria-hidden />
        </span>
      </span>
      <h1 className="mt-6 max-w-xl text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-slate-600">{message}</p>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
        <button type="button" onClick={() => startTransition(retry)} disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
          {pending ? "Retrying…" : "Try again"}
        </button>
        <Link href="/" className="btn-outline">
          <Home className="size-4" aria-hidden /> Go to home page
        </Link>
      </div>

      {!compact && (
        <div className="mt-10 w-full max-w-md rounded-2xl bg-white p-5 text-left ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-navy-900">Need help right now?</p>
          <p className="mt-1 text-sm text-slate-600">Our team can share prices, layouts and site-visit slots directly.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a href={`tel:${site.phone.tel}`} className="btn-outline">
              <Phone className="size-4" aria-hidden /> Call us
            </a>
            <a href={whatsappLink("Hi, I was browsing your website and need some help.")} className="btn-whatsapp">
              <WhatsAppIcon className="size-5" /> WhatsApp
            </a>
          </div>
        </div>
      )}

      {digest && <p className="mt-6 text-xs text-slate-500">Reference: {digest}</p>}
    </section>
  );
}
