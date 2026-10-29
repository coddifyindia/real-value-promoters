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
      body: <a href={`mailto:${site.email}`} className="break-all hover:text-brand-700">{site.email}</a>,
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

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div id="enquire" className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 sm:p-8">
          <h2 className="text-2xl">Send an enquiry</h2>
          <p className="mt-1 mb-6 text-sm text-slate-600">Tell us your budget, preferred location or a project you liked.</p>
          <LeadForm defaultKind="contact" />
        </div>

        <div className="space-y-4">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {cards.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-navy-900">{title}</p>
                  <div className="mt-0.5 text-slate-600">{body}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <iframe
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              title="Map showing the Real Value office in Pattanam, Coimbatore"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
