"use client";

import {
  CalendarCheck,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { track } from "@vercel/analytics";
import { useActionState, useEffect, useId, useState } from "react";
import { submitLead } from "@/app/actions/leads";
import type { LeadKind } from "@/lib/types";
import type { FormState } from "@/lib/validation";
import { Honeypot, usePublicFormSubmit, withNetworkFallback } from "./form-meta";
import { FieldError, WithIcon } from "./field";
import { WhatsAppIcon } from "./icons";

type Props = {
  /** Shown when the form is about one property. Enables the enquiry / site visit toggle. */
  property?: { slug: string; name: string };
  defaultKind?: LeadKind;
  title?: string;
  compact?: boolean;
  /** Prefills the message box (e.g. with the visitor's shortlist). */
  defaultMessage?: string;
};

const initial: FormState = { status: "idle" };
const submit = withNetworkFallback(submitLead);

export function LeadForm({ property, defaultKind, title, compact = false, defaultMessage }: Props) {
  const [state, action, pending] = useActionState(submit, initial);
  const [kind, setKind] = useState<LeadKind>(defaultKind ?? (property ? "enquiry" : "contact"));
  const id = useId();
  const onSubmit = usePublicFormSubmit(action);

  useEffect(() => {
    if (state.status === "success") track("Lead", { kind, property: property?.name ?? "none" });
    // Only when a submission succeeds, not when the visitor toggles the kind afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="enter rounded-2xl border border-green-200 bg-green-50 p-6 text-center" role="status">
        <span className="relative mx-auto flex size-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400/30 [animation-iteration-count:2]" aria-hidden />
          <CheckCircle2 className="relative size-12 text-green-600" aria-hidden />
        </span>
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
  const errorText = (name: string) => (err[name] ? <FieldError id={`${id}-${name}-error`}>{err[name]}</FieldError> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      {title && <h3 className="text-xl">{title}</h3>}
      <Honeypot />
      <input type="hidden" name="kind" value={kind} />
      {property && <input type="hidden" name="propertySlug" value={property.slug} />}

      {property && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1.5" role="radiogroup" aria-label="Request type">
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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-slate-600 transition-all hover:text-navy-900 aria-checked:bg-white aria-checked:text-brand-700 aria-checked:shadow-[0_1px_3px_rgb(15_23_42/0.12)]"
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
        <WithIcon icon={User}>
          <input {...field("name")} type="text" autoComplete="name" required className="field field-icon" placeholder="Your name" />
        </WithIcon>
        {errorText("name")}
      </div>

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor={`${id}-phone`} className="label">
            Phone / WhatsApp
          </label>
          <WithIcon icon={Phone}>
            <input
              {...field("phone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              className="field field-icon"
              placeholder="98765 43210"
            />
          </WithIcon>
          {errorText("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="label">
            Email
          </label>
          <WithIcon icon={Mail}>
            <input
              {...field("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              className="field field-icon"
              placeholder="you@example.com"
            />
          </WithIcon>
          {errorText("email")}
        </div>
      </div>

      {kind === "site_visit" && (
        <div>
          <label htmlFor={`${id}-preferredDate`} className="label">
            Preferred visit date
          </label>
          <WithIcon icon={CalendarDays}>
            <input
              {...field("preferredDate")}
              // Set on the client so the prerendered HTML doesn't bake in a stale date.
              ref={(el) => {
                if (el) el.min = new Date().toLocaleDateString("en-CA");
              }}
              type="date"
              required
              className="field field-icon"
            />
          </WithIcon>
          {errorText("preferredDate")}
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
            <Car className="size-4 text-gold-600" aria-hidden /> Free pickup available for site visits.
          </p>
        </div>
      )}

      <div>
        <label htmlFor={`${id}-message`} className="label">
          Message <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          {...field("message")}
          rows={compact ? 3 : 4}
          defaultValue={defaultMessage}
          className="field min-h-28 resize-y"
          placeholder={property ? `I'm interested in ${property.name}…` : "Budget, preferred location, plot size…"}
        />
        {errorText("message")}
      </div>

      {state.status === "error" && state.message && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
          <p>
            {state.message}
            {state.whatsappUrl && (
              <a href={state.whatsappUrl} className="ml-1 font-semibold underline underline-offset-2">
                Message us on WhatsApp
              </a>
            )}
          </p>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary btn-lg w-full">
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Send className="size-[18px]" aria-hidden />}
        {pending ? "Sending…" : kind === "site_visit" ? "Request site visit" : "Send enquiry"}
      </button>
      <p className="text-center text-xs text-balance text-slate-500">
        <ShieldCheck className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
        We&apos;ll only use your details to respond to this enquiry.
      </p>
    </form>
  );
}
