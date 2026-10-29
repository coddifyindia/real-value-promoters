"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { subscribe } from "@/app/actions/leads";
import type { FormState } from "@/lib/validation";
import { Honeypot, usePublicFormSubmit } from "./form-meta";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, { status: "idle" } as FormState);
  const onSubmit = usePublicFormSubmit(action);

  if (state.status === "success") {
    return (
      <p className="rounded-lg bg-white/10 p-3 text-sm text-white" role="status">
        {state.message ?? "You're subscribed."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <Honeypot />
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          aria-invalid={state.status === "error" || undefined}
          className="min-h-11 w-full min-w-0 rounded-full border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-white/50 focus:border-gold-400 focus:outline-none sm:text-sm"
        />
        <button type="submit" disabled={pending} className="btn-gold shrink-0">
          {pending ? <Loader2 className="size-4 animate-spin" aria-label="Subscribing" /> : "Subscribe"}
        </button>
      </div>
      {state.status === "error" && (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
