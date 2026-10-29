import { Building2, Car, FileSearch, HandCoins, Home, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Plot and villa sales, residential construction, home loan assistance, document verification and free site visits from Real Value Promoters.",
  alternates: { canonical: "/services" },
};

const services = [
  { icon: Home, title: "Plot & villa sales", text: "Professional help buying plots and villas in approved, gated layouts, with honest advice on location and value." },
  { icon: Building2, title: "Residential construction", text: "Build your home on your plot with our construction team: modern designs, quality materials and on-time delivery." },
  { icon: HandCoins, title: "Home loan assistance", text: "Bank loans of 75–85% through SBI, HDFC Bank, LIC Housing Finance and Tata Capital. We handle the paperwork with you." },
  { icon: FileSearch, title: "Document verification", text: "DTCP and RERA approvals, patta, EC and title documents checked and explained before you commit." },
  { icon: Car, title: "Free site visits", text: "See any project in person. We arrange pickup and a guided walkthrough at a time that suits you." },
  { icon: KeyRound, title: "After-sales support", text: "Help with registration, construction and resale long after the sale is complete." },
];

const villaFeatures = [
  { title: "Fully furnished options", text: "Modern, comfortable furnishings in select villa projects." },
  { title: "Premium finishes", text: "Quality paint, fittings and materials throughout." },
  { title: "24/7 security", text: "Gated entry, CCTV and security staff in our communities." },
];

export default function ServicesPage() {
  return (
    <>
      <section className="container-x py-12 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Our services"
          title="Everything you need to buy land with confidence"
          description="One team from your first enquiry to registration, and beyond."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-16 text-white sm:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold-300">Villa projects</p>
            <h2 className="mt-2 text-3xl text-white sm:text-4xl">Built for comfortable living</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {villaFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/70">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact#enquire" className="btn-gold">Talk to our team</Link>
          </div>
        </div>
      </section>
    </>
  );
}
