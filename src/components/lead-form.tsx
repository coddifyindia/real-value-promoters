"use client";

import { CalendarCheck, CheckCircle2, Loader2, MessageSquareText } from "lucide-react";
import { useActionState, useId, useState } from "react";
import { submitLead } from "@/app/actions/leads";
import type { LeadKind } from "@/lib/types";
import type { FormState } from "@/lib/validation";
import { Honeypot, usePublicFormSubmit } from "./form-meta";
import { WhatsAppIcon } from "./icons";

type Props = {
  /** Shown when the form is about one property. Enables the enquiry / site visit toggle. */
  property?: { slug: string; name: string };
  defaultKind?: LeadKind;
  title?: string;
  compact?: boolean;
};

const initial: FormState = { status: "idle" };

export function LeadForm({ property, defaultKind, title, compact = false }: Props) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const [kind, setKind] = useState<LeadKind>(defaultKind ?? (property ? "enquiry" : "contact"));
  const id = useId();
  const onSubmit = usePublicFormSubmit(action);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center" role="status">
        <CheckCircle2 className="mx-auto size-10 text-green-600" aria-hidden />
        <h3 className="mt-3 text-xl">Thank you! We&apos;ve got your request.</h3>
        <p className="mt-2 text-sm text-slate-600">
          Our team will call you within one working day. We&apos;ve also emailed you a confirmation.
        </p>
        {state.whatsappUrl && (
          <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5 w-full sm:w-auto">
            <WhatsAppIcon className="size-5" /> Continue on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  const field = (name: string) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${id}-${name}-error` : undefined,
  });
  const errorText = (name: string) =>
    err[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1 text-sm text-red-600">
        {err[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-4">
      {title && <h3 className="text-xl">{title}</h3>}
      <Honeypot />
      <input type="hidden" name="kind" value={kind} />
      {property && <input type="hidden" name="propertySlug" value={property.slug} />}

      {property && (
        <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1" role="radiogroup" aria-label="Request type">
          {(
            [
              ["enquiry", "Enquire", MessageSquareText],
              ["site_visit", "Site visit", CalendarCheck],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={kind === value}
              onClick={() => setKind(value)}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-slate-600 transition-colors aria-checked:bg-white aria-checked:text-navy-900 aria-checked:shadow-sm"
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
      )}

      <div>
        <label htmlFor={`${id}-name`} className="label">
          Full name
        </label>
        <input {...field("name")} type="text" autoComplete="name" required className="field" placeholder="Your name" />
        {errorText("name")}
      </div>

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor={`${id}-phone`} className="label">
            Phone / WhatsApp
          </label>
          <input
            {...field("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className="field"
            placeholder="98765 43210"
          />
          {errorText("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="label">
            Email
          </label>
          <input
            {...field("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className="field"
            placeholder="you@example.com"
          />
          {errorText("email")}
        </div>
      </div>

      {kind === "site_visit" && (
        <div>
          <label htmlFor={`${id}-preferredDate`} className="label">
            Preferred visit date
          </label>
          <input
            {...field("preferredDate")}
            // Set on the client so the prerendered HTML doesn't bake in a stale date.
            ref={(el) => {
              if (el) el.min = new Date().toLocaleDateString("en-CA");
            }}
            type="date"
            required
            className="field"
          />
          {errorText("preferredDate")}
          <p className="mt-1 text-xs text-slate-500">Free pickup available for site visits.</p>
        </div>
      )}

      <div>
        <label htmlFor={`${id}-message`} className="label">
          Message <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          {...field("message")}
          rows={compact ? 3 : 4}
          className="field resize-y"
          placeholder={property ? `I'm interested in ${property.name}…` : "Budget, preferred location, plot size…"}
        />
        {errorText("message")}
      </div>

      {state.status === "error" && state.message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {state.message}
          {state.whatsappUrl && (
            <a href={state.whatsappUrl} className="ml-1 font-semibold underline">
              Message us on WhatsApp
            </a>
          )}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Sending…" : kind === "site_visit" ? "Request site visit" : "Send enquiry"}
      </button>
      <p className="text-center text-xs text-slate-500">
        We&apos;ll only use your details to respond to this enquiry.
      </p>
    </form>
  );
}
