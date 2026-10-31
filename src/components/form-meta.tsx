"use client";

import { useCallback, useEffect, useRef, startTransition, type FormEvent } from "react";
import { site, whatsappLink } from "@/lib/site";
import type { FormState } from "@/lib/validation";

const UTM_KEY = "rvp_utm";

// Records the first campaign a visitor arrived from, for lead attribution.
export function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      params.forEach((v, k) => {
        if (k.startsWith("utm_")) utm[k] = v;
      });
      if (Object.keys(utm).length && !sessionStorage.getItem(UTM_KEY)) {
        sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
      }
    } catch {
      // Storage unavailable (private mode); attribution is best-effort.
    }
  }, []);
  return null;
}

/**
 * Submits a form to a server action without React's automatic form reset,
 * so a validation error doesn't wipe what the person typed. `extend` can add
 * fields to the FormData at submit time.
 */
export function useActionSubmit(action: (formData: FormData) => void, extend?: (fd: FormData) => void) {
  return useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      extend?.(fd);
      startTransition(() => action(fd));
    },
    [action, extend],
  );
}

/** useActionSubmit plus the spam-timing and attribution fields public forms send. */
export function usePublicFormSubmit(action: (formData: FormData) => void) {
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const extend = useCallback((fd: FormData) => {
    fd.set("startedAt", String(mountedAt.current));
    fd.set("sourcePath", window.location.pathname);
    try {
      fd.set("utm", sessionStorage.getItem(UTM_KEY) ?? "");
    } catch {}
  }, []);
  return useActionSubmit(action, extend);
}

/**
 * Wraps a server action so a dropped connection (offline, flaky mobile data,
 * a deploy mid-request) becomes a friendly message in the form instead of
 * throwing to the page's error boundary. Define the result at module level so
 * its identity is stable for useActionState.
 */
export function withNetworkFallback(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  return async (prev: FormState, formData: FormData): Promise<FormState> => {
    try {
      return await action(prev, formData);
    } catch {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      return {
        status: "error",
        message: offline
          ? "You seem to be offline. Check your connection and try again; what you typed is still here."
          : `We couldn't reach our server. Please try again, or call ${site.phone.display}.`,
        whatsappUrl: whatsappLink("Hi, I tried to send an enquiry on your website but it didn't go through."),
      };
    }
  };
}

// Honeypot: hidden from people, irresistible to bots.
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
