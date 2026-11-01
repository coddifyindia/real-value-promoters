"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { sendLeadEmails } from "@/lib/email";
import { getPropertyBySlug } from "@/lib/properties";
import { site, whatsappLink } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/service";
import { fieldErrorsOf, leadSchema, subscribeSchema, type FormState, type LeadInput } from "@/lib/validation";

const RATE_LIMIT = { max: 5, windowMinutes: 10 };
const MIN_FILL_MS = 2500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requestInfo() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.LEAD_HASH_SALT ?? process.env.SUPABASE_SECRET_KEY ?? "rvp";
  return {
    ipHash: createHash("sha256").update(`${salt}:${ip}`).digest("hex"),
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  };
}

// Bots fill hidden fields and submit instantly; real people do neither.
function looksAutomated(formData: FormData) {
  const honeypot = String(formData.get("website") ?? "");
  const startedAt = Number(formData.get("startedAt") ?? 0);
  return honeypot !== "" || !startedAt || Date.now() - startedAt < MIN_FILL_MS;
}

function utmFrom(formData: FormData) {
  const raw = String(formData.get("utm") ?? "");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (/^utm_[a-z]+$/.test(k) && typeof v === "string") out[k] = v.slice(0, 100);
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

export async function submitLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const input = parsed.data;

  // The catalogue lookup only adds context; a hiccup there must not lose the lead.
  const property = input.propertySlug ? await getPropertyBySlug(input.propertySlug).catch(() => null) : null;
  const waText = property
    ? `Hi, I'm ${input.name}. I just enquired about ${property.name} on your website.`
    : `Hi, I'm ${input.name}. I just sent an enquiry on your website.`;

  if (looksAutomated(formData)) {
    // Pretend it worked so bots don't learn to adapt.
    return { status: "success", whatsappUrl: whatsappLink(waText) };
  }

  try {
    const result = await saveLead(input, formData, property, waText);
    if (result !== DB_FAILED) return result;
  } catch (err) {
    // Database down, timeout, misconfiguration: never surface a 500 to a buyer.
    console.error("[leads] unexpected failure", err);
  }

  // The database couldn't take the lead. Email it straight to the team so it
  // isn't lost; only if that fails too does the visitor see an error.
  const emailed = await sendLeadEmails({ ...emailFields(input, property), id: `unsaved-${randomUUID()}`, unsaved: true }).catch(
    () => false,
  );
  if (emailed) return { status: "success", whatsappUrl: whatsappLink(waText) };
  return {
    status: "error",
    message: `Sorry, we couldn't send that just now. Please call us on ${site.phone.display} or message us on WhatsApp.`,
    whatsappUrl: whatsappLink(waText),
  };
}

const DB_FAILED = Symbol("db-failed");

function emailFields(input: LeadInput, property: Awaited<ReturnType<typeof getPropertyBySlug>>) {
  return {
    kind: input.kind,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    propertyName: property?.name ?? null,
    propertyUrl: property ? `${site.url}/properties/${property.slug}` : null,
    preferredDate: input.preferredDate,
  };
}

async function saveLead(
  input: LeadInput,
  formData: FormData,
  property: Awaited<ReturnType<typeof getPropertyBySlug>>,
  waText: string,
): Promise<FormState | typeof DB_FAILED> {
  const supabase = createServiceClient();
  const { ipHash, userAgent } = await requestInfo();

  const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
  const { count, error: countError } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (countError) {
    console.error("[leads] rate-limit check failed", countError);
    return DB_FAILED;
  }
  if ((count ?? 0) >= RATE_LIMIT.max) {
    return {
      status: "error",
      message: `Too many enquiries from this connection. Please call us on ${site.phone.display} instead.`,
    };
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message || null,
      property_id: property && UUID.test(property.id) ? property.id : null,
      property_name: property?.name ?? null,
      preferred_date: input.preferredDate || null,
      source_path: input.sourcePath || null,
      utm: utmFrom(formData),
      ip_hash: ipHash,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (error || !lead) {
    console.error("[leads] insert failed", error);
    return DB_FAILED;
  }

  // The lead is safely stored; send emails after the response so the visitor isn't kept waiting.
  after(() => sendLeadEmails({ ...emailFields(input, property), id: lead.id }));

  return { status: "success", whatsappUrl: whatsappLink(waText) };
}

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = subscribeSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: fieldErrorsOf(parsed.error).email };
  }
  if (looksAutomated(formData)) return { status: "success" };

  try {
    const supabase = createServiceClient();
    const { ipHash } = await requestInfo();

    // Same per-connection limit as enquiries, so the list can't be flooded.
    const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
    const { count } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT.max) {
      return { status: "error", message: "Too many sign-ups from this connection. Please try again later." };
    }

    const row = {
      email: parsed.data.email.toLowerCase(),
      source_path: String(formData.get("sourcePath") ?? "").slice(0, 300) || null,
    };
    let { error } = await supabase.from("subscribers").insert({ ...row, ip_hash: ipHash });
    // Databases set up before migration 20261031 have no ip_hash column yet:
    // still record the sign-up rather than lose it.
    if (error && (error.code === "PGRST204" || error.code === "42703")) {
      ({ error } = await supabase.from("subscribers").insert(row));
    }

    // 23505 = already subscribed; treat as success (and don't reveal who is on the list).
    if (error && error.code !== "23505") {
      console.error("[subscribe] insert failed", error);
      return { status: "error", message: "Couldn't subscribe right now. Please try again later." };
    }
    return { status: "success", message: "You're subscribed. We'll email you about new launches." };
  } catch (err) {
    console.error("[subscribe] unexpected failure", err);
    return { status: "error", message: "Couldn't subscribe right now. Please try again later." };
  }
}
