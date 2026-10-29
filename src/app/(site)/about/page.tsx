import { Eye, Gem, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { testimonials } from "@/lib/content";
import { getCities, getPublishedProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Real Value Land Promoters and Builders develops gated plots, villas and farm land across Tamil Nadu. Learn about our vision, values and the families we serve.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Eye, title: "Vision", text: "To lead the housing sector by bringing the comfort of upscale living within reach of every family." },
  { icon: Gem, title: "Strength", text: "Committed to excellence in all we do, delivering quality projects at the best value." },
  { icon: Trophy, title: "Success", text: "Comfortable, quality projects delivered on time, shaped by what buyers actually need." },
  { icon: Users, title: "Team", text: "Our focus on quality and local understanding runs from management to every site team." },
];

export default async function AboutPage() {
  const properties = await getPublishedProperties();
  const stats = [
    { value: properties.length, label: "Active projects" },
    { value: getCities(properties).length, label: "Cities" },
    { value: "DTCP & RERA", label: "Approved layouts" },
  ];

  return (
    <>
      <section className="container-x grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">About us</p>
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">Building trust, one plot at a time</h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Real Value Land Promoters and Builders is a Coimbatore-based developer of premium residential layouts. We
            create gated communities with the amenities families need, in locations with real growth potential, and
            we price them so more people can own land.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <dd className="font-display text-2xl text-brand-700 sm:text-3xl">{s.value}</dd>
                <dt className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/properties" className="btn-primary">View properties</Link>
            <Link href="/contact" className="btn-outline">Contact us</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lift">
          <Image
            src="/images/properties/opal-garden/01.webp"
            alt="Entrance of Opal Garden by Greenfield Housing, Coimbatore"
            fill
            priority
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="What guides us" title="Our core values" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Testimonials" title="Families who chose Real Value" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
                <blockquote className="text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-navy-900">{t.name}</span>
                  <span className="text-slate-500"> · {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
