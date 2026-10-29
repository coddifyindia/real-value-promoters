import "server-only";
import { Resend } from "resend";
import { site, whatsappLink } from "./site";
import { LEAD_KIND_LABELS, type LeadKind } from "./types";

type LeadEmail = {
  id: string;
  kind: LeadKind;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyName: string | null;
  propertyUrl: string | null;
  preferredDate: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0b1f3a;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold">${esc(site.name)}</td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 16px;font-size:20px;color:#0b1f3a">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px;background:#f9fafb;font-size:12px;color:#6b7280">${esc(site.legalName)} · ${esc(site.address.street)}, ${esc(site.address.locality)} ${esc(site.address.postalCode)}</td></tr>
</table></td></tr></table></body></html>`;
}

const prettyDate = (iso: string) =>
  new Date(`${iso}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;font-weight:bold">${value}</td></tr>`;
}

function teamEmail(l: LeadEmail) {
  const rows = [
    row("Type", esc(LEAD_KIND_LABELS[l.kind])),
    row("Name", esc(l.name)),
    row("Phone", `<a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>`),
    row("Email", `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>`),
    l.propertyName
      ? row("Property", l.propertyUrl ? `<a href="${esc(l.propertyUrl)}">${esc(l.propertyName)}</a>` : esc(l.propertyName))
      : "",
    l.preferredDate ? row("Visit date", esc(prettyDate(l.preferredDate))) : "",
    l.message ? row("Message", esc(l.message).replace(/\n/g, "<br>")) : "",
  ].join("");
  const digits = l.phone.replace(/\D/g, "");
  const wa = `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
  const body = `<table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:24px 0 0"><a href="${wa}" style="background:#16a34a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">WhatsApp ${esc(l.name.split(" ")[0])}</a>
&nbsp; <a href="${esc(site.url)}/admin" style="color:#1e4fa3">Open in admin</a></p>`;
  return layout(`New ${LEAD_KIND_LABELS[l.kind].toLowerCase()}`, body);
}

function visitorEmail(l: LeadEmail) {
  const what = l.propertyName ? ` about <strong>${esc(l.propertyName)}</strong>` : "";
  const visit =
    l.kind === "site_visit" && l.preferredDate
      ? `<p>You asked to visit on <strong>${esc(prettyDate(l.preferredDate))}</strong>. We'll call to confirm the time and arrange pickup if you need it.</p>`
      : "";
  const body = `<p>Hi ${esc(l.name.split(" ")[0])},</p>
<p>Thank you for contacting us${what}. Our team will call you on <strong>${esc(l.phone)}</strong> within one working day.</p>
${visit}
<p>Prefer to chat now? Message us on WhatsApp:</p>
<p><a href="${whatsappLink(`Hi, I just enquired on your website${l.propertyName ? ` about ${l.propertyName}` : ""}.`)}" style="background:#16a34a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Chat on WhatsApp</a></p>
<p style="margin-top:24px">Regards,<br>${esc(site.name)}<br><a href="tel:${site.phone.tel}">${site.phone.display}</a></p>`;
  return layout("We've received your enquiry", body);
}

export async function sendLeadEmails(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const team = (process.env.LEADS_NOTIFY_EMAIL ?? site.email)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!apiKey || !from) {
    console.warn(`[email] RESEND_API_KEY/RESEND_FROM_EMAIL not set; skipped emails for lead ${lead.id}`);
    return;
  }

  const resend = new Resend(apiKey);
  const subjectFor = lead.propertyName ? ` – ${lead.propertyName}` : "";
  const results = await Promise.allSettled([
    resend.emails.send(
      {
        from,
        to: team,
        replyTo: lead.email,
        subject: `New ${LEAD_KIND_LABELS[lead.kind].toLowerCase()}: ${lead.name}${subjectFor}`,
        html: teamEmail(lead),
      },
      { idempotencyKey: `lead-team-${lead.id}` },
    ),
    resend.emails.send(
      {
        from,
        to: lead.email,
        replyTo: team[0],
        subject: `Thanks for your enquiry${subjectFor} | ${site.name}`,
        html: visitorEmail(lead),
      },
      { idempotencyKey: `lead-visitor-${lead.id}` },
    ),
  ]);

  results.forEach((r, i) => {
    const who = i === 0 ? "team" : "visitor";
    if (r.status === "rejected") console.error(`[email] ${who} email failed for lead ${lead.id}`, r.reason);
    else if (r.value.error) console.error(`[email] ${who} email failed for lead ${lead.id}`, r.value.error);
  });
}
