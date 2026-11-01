import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us & Book a Site Visit",
  description: `Call ${site.phone.display}, WhatsApp ${site.whatsapp.display} or send an enquiry to book a free site visit. Office at Pattanam, Coimbatore.`,
  alternates: { canonical: "/contact" },
};

const mapQuery = encodeURIComponent(`Real Value Enclave, Pattanam, Coimbatore ${site.address.postalCode}`);

export default function ContactPage() {
  const cards = [
    {
      icon: Phone,
      title: "Call us",
      body: <a href={`tel:${site.phone.tel}`} className="hover:text-brand-700">{site.phone.display}</a>,
    },
    {
      icon: WhatsAppIcon,
      title: "WhatsApp",
      body: <a href={whatsappLink()} className="hover:text-brand-700">{site.whatsapp.display}</a>,
    },
    {
      icon: Mail,
      title: "Email",
      body: (
        // Break after the @ (never mid-word) when the address doesn't fit on one line.
        <a href={`mailto:${site.email}`} className="hover:text-brand-700">
          {site.email.split("@")[0]}@<wbr />
          {site.email.split("@")[1]}
        </a>
      ),
    },
    {
      icon: MapPin,
      title: "Office",
      body: (
        <span>
          {site.address.street}, {site.address.locality} – {site.address.postalCode}
        </span>
      ),
    },
  ];

  return (
    <div className="container-x py-12 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Contact"
        title="Let's find the right plot for you"
        description="Send an enquiry and we'll call you within one working day, or reach us directly."
      />

      {/* Form and contact cards share one row height: the four cards stretch to fill
          the form's height, so neither column leaves an empty block under it. */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <div id="enquire" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 sm:p-10">
          <h2 className="text-3xl">Send an enquiry</h2>
          <p className="mt-2 mb-8 text-slate-600">Tell us your budget, preferred location or a project you liked.</p>
          <LeadForm defaultKind="contact" />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-4">
          {cards.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-5 rounded-3xl bg-white p-5 ring-1 ring-slate-200/70 sm:p-6">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">{title}</p>
                <div className="mt-1 text-[17px] leading-snug font-medium text-navy-900">{body}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 h-80 overflow-hidden rounded-3xl ring-1 ring-slate-200 sm:h-96 lg:mt-8">
        <iframe
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          title="Map showing the Real Value office in Pattanam, Coimbatore"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="size-full border-0"
        />
      </div>
    </div>
  );
}
