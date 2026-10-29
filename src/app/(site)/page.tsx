import {
  BadgeCheck,
  Banknote,
  Car,
  FileCheck2,
  Handshake,
  Landmark,
  MapPinned,
  Quote,
  ShieldCheck,
  Trees,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { PropertyGrid } from "@/components/property-card";
import { SectionHeading } from "@/components/section-heading";
import { getCities, getPublishedProperties } from "@/lib/properties";
import { testimonials } from "@/lib/content";

const trust = [
  { icon: BadgeCheck, title: "DTCP & RERA approved", text: "Legally clear layouts" },
  { icon: Banknote, title: "75–85% bank loans", text: "SBI, HDFC, LIC HFL & more" },
  { icon: Car, title: "Free site visits", text: "Cab pickup on request" },
  { icon: FileCheck2, title: "Clear documentation", text: "Patta, EC & title support" },
];

const reasons = [
  { icon: MapPinned, title: "Prime, growing locations", text: "Projects near highways, bypasses, colleges and new bus stands, chosen for long-term appreciation." },
  { icon: ShieldCheck, title: "Transparent dealings", text: "Approved layouts, clear pricing and every document explained before you pay." },
  { icon: Handshake, title: "Guidance at every step", text: "From shortlisting and site visits to bank loans and registration, one team handles it." },
  { icon: Trees, title: "Amenities that matter", text: "Gated entrances, tar roads, parks, street lights, water lines and CCTV in our layouts." },
  { icon: Landmark, title: "Trusted partners", text: "Channel partner of Greenfield Housing, with tie-ups across leading banks." },
  { icon: BadgeCheck, title: "After-sales support", text: "We stay in touch after registration for construction, resale and documentation help." },
];

const steps = [
  { title: "Shortlist", text: "Tell us your budget and preferred area. We'll suggest the right projects." },
  { title: "Visit the site", text: "See the layout in person. We arrange pickup and walk you through it." },
  { title: "Loan & documents", text: "We help with bank loan approval and verify every document with you." },
  { title: "Register & own", text: "Complete registration and get your land, with support after you buy." },
];

export default async function HomePage() {
  const properties = await getPublishedProperties();
  const featured = properties.filter((p) => p.featured).slice(0, 6);
  const cities = getCities(properties);
  const cityCounts = cities.map((c) => ({ city: c, count: properties.filter((p) => p.city === c).length }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-950">
        <Image
          src="/images/properties/diamond-avenue/01.webp"
          alt="Entrance arch of Diamond Avenue, a Real Value gated community in Coimbatore"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/10" />
        <div className="container-x flex min-h-[78svh] flex-col justify-end pt-24 pb-12 sm:pb-16 lg:min-h-[640px]">
          <p className="eyebrow text-gold-300">Coimbatore · Trichy · Madurai · Erode · Pollachi</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            Own land you can be proud of, in places that keep growing.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
            DTCP &amp; RERA approved plots, villas and farm land with gated amenities, clear documents and bank loan
            support.
          </p>

          <form action="/properties" className="mt-8 grid max-w-3xl gap-2 rounded-2xl bg-white p-2 shadow-lift sm:grid-cols-[1fr_1fr_auto]">
            <label>
              <span className="sr-only">City</span>
              <select name="city" className="field border-transparent">
                <option value="">Any city</option>
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Property type</span>
              <select name="type" className="field border-transparent">
                <option value="">Any type</option>
                <option value="plot">Plot</option>
                <option value="villa">Villa</option>
                <option value="farm_land">Farm Land</option>
              </select>
            </label>
            <button type="submit" className="btn-primary px-8">
              Find properties
            </button>
          </form>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-x grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-900">{title}</p>
                <p className="text-xs text-slate-500 sm:text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Featured projects"
              title="Handpicked plots and villas"
              description="Gated layouts in high-growth corridors, priced for first-time buyers and investors alike."
            />
            <Link href="/properties" className="btn-outline shrink-0 self-start sm:self-auto">
              View all {properties.length} projects
            </Link>
          </div>
          <div className="mt-10">
            <PropertyGrid properties={featured} />
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Where we build" title="Projects across Tamil Nadu" />
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cityCounts.map(({ city, count }) => (
              <li key={city}>
                <Link
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-brand-500 hover:shadow-card"
                >
                  <span className="font-display text-xl text-navy-900">{city}</span>
                  <span className="mt-1 text-sm text-slate-500">
                    {count} {count === 1 ? "project" : "projects"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Why Real Value"
            title="Buying land should feel safe. We make sure it does."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-navy-900 py-16 text-white sm:py-24">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold-300">How it works</p>
            <h2 className="mt-2 text-3xl text-white sm:text-4xl">From first call to registration</h2>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="font-display text-4xl text-gold-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimonials + partners */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Happy families" title="What our buyers say" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
                <Quote className="size-8 text-gold-400" aria-hidden />
                <blockquote className="mt-3 flex-1 text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4">
                  <p className="font-semibold text-navy-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-16 grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
            <div>
              <p className="eyebrow">Channel partner of</p>
              <p className="mt-1 font-display text-2xl text-navy-900">Greenfield Housing</p>
              <p className="text-sm text-slate-500">Land of Happiness</p>
            </div>
            <div className="lg:border-l lg:border-slate-200 lg:pl-8">
              <p className="eyebrow">Home loan partners</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {["SBI", "HDFC Bank", "LIC Housing Finance", "Tata Capital"].map((b) => (
                  <li key={b} className="rounded-full bg-sand-100 px-4 py-2 text-sm font-semibold text-navy-800">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 sm:py-24" id="enquire">
        <div className="container-x grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Talk to us"
              title="Book a free site visit"
              description="Share a few details and our team will call you within one working day with options that fit your budget. Pickup is on us."
            />
            <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/properties/golden-farms/01.webp"
                alt="Aerial view of Real Value Golden Farms near Pollachi"
                fill
                sizes="600px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200 sm:p-8">
            <LeadForm defaultKind="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
