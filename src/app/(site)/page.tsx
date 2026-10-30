import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Car,
  FileCheck2,
  Handshake,
  Landmark,
  MapPinned,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
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

const heroSlides = [
  { src: "/images/properties/diamond-avenue/01.webp", alt: "Entrance arch of Diamond Avenue, a Real Value gated community in Coimbatore" },
  { src: "/images/properties/golden-farms/01.webp", alt: "" },
  { src: "/images/properties/crystal-gateway/01.webp", alt: "" },
  { src: "/images/properties/thulir-garden/01.webp", alt: "" },
];

const loanPartners = ["SBI", "HDFC Bank", "LIC Housing Finance", "Tata Capital"];

function heroStats(projects: number, cities: number) {
  return [
    [String(projects), "Live projects"],
    [String(cities), "Cities in Tamil Nadu"],
    ["85%", "Bank loan support"],
  ] as const;
}

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
  // Biggest market first: it gets the large tile.
  const cityTiles = cities
    .map((city) => {
      const inCity = properties.filter((p) => p.city === city);
      return { city, count: inCity.length, image: inCity.find((p) => p.images.length)?.images[0] };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-950">
        <div className="absolute inset-0 -z-10">
          {heroSlides.map((slide, i) => (
            <div key={slide.src} className="hero-slide absolute inset-0" style={{ "--i": i } as React.CSSProperties}>
              <Image
                src={slide.src}
                alt={i === 0 ? slide.alt : ""}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgb(220_171_82/0.18),transparent_55%)]" />

        <div className="container-x flex min-h-[86svh] flex-col justify-end pt-28 pb-10 sm:pb-14 lg:min-h-[720px]">
          <p className="enter inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md" style={{ "--d": 0 } as React.CSSProperties}>
            <Sparkles className="size-3.5 text-gold-300" aria-hidden />
            DTCP &amp; RERA approved · {properties.length} live projects
          </p>
          <h1
            className="enter mt-5 max-w-4xl text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl"
            style={{ "--d": 1 } as React.CSSProperties}
          >
            Own land you can be proud of, in places that{" "}
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent italic">keep growing.</span>
          </h1>
          <p className="enter mt-5 max-w-2xl text-base text-white/80 sm:text-lg" style={{ "--d": 2 } as React.CSSProperties}>
            Gated plots, villas and farm land across Coimbatore, Trichy, Madurai, Erode and Pollachi, with clear
            documents, bank loans and free site visits.
          </p>

          <form
            action="/properties"
            className="enter mt-8 grid max-w-3xl gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 shadow-lift backdrop-blur-xl sm:grid-cols-[1fr_1fr_auto]"
            style={{ "--d": 3 } as React.CSSProperties}
          >
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
            <button type="submit" className="btn-gold px-8">
              <Search className="size-4" aria-hidden /> Find properties
            </button>
          </form>

          <dl className="enter mt-10 grid max-w-3xl grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6" style={{ "--d": 4 } as React.CSSProperties}>
            {heroStats(properties.length, cities.length).map(([value, label]) => (
              <div key={label} className="flex flex-col px-3 first:pl-0 sm:px-6">
                <dt className="order-2 text-xs text-white/60 sm:text-sm">{label}</dt>
                <dd className="font-display text-2xl text-white sm:text-4xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-x grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="reveal flex items-start gap-3">
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
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Where we build" title="Projects across Tamil Nadu" />
          <ul className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:grid-cols-4">
            {cityTiles.map(({ city, count, image }, i) => (
              <li key={city} className={`reveal ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <Link
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl bg-navy-900 p-5 text-white"
                >
                  {image && (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                      className="-z-0 object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-90"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
                  <span className="relative flex items-end justify-between gap-2">
                    <span>
                      <span className={`block font-display text-white ${i === 0 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>{city}</span>
                      <span className="mt-0.5 block text-sm text-white/75">
                        {count} {count === 1 ? "project" : "projects"}
                      </span>
                    </span>
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-gold-400 group-hover:text-navy-950">
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
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
              <div
                key={title}
                className="reveal group rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
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
      <section className="relative isolate overflow-hidden bg-navy-900 py-16 text-white sm:py-24">
        <div className="absolute -top-40 -right-40 -z-10 size-[30rem] rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-40 -z-10 size-[30rem] rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold-300">How it works</p>
            <h2 className="mt-2 text-3xl text-white sm:text-4xl">From first call to registration</h2>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="reveal relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-gold-400/40 hover:bg-white/10">
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
              <figure key={t.name} className="reveal flex flex-col rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
                <Quote className="size-8 text-gold-400" aria-hidden />
                <blockquote className="mt-3 flex-1 text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4">
                  <p className="font-semibold text-navy-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="reveal mt-16 grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)]">
            <div>
              <p className="eyebrow">Channel partner of</p>
              <p className="mt-1 font-display text-2xl text-navy-900">Greenfield Housing</p>
              <p className="text-sm text-slate-500">Land of Happiness</p>
            </div>
            <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-8">
              <p className="eyebrow">Home loan partners</p>
              <div className="marquee mt-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                {/* Rendered twice so the loop is seamless; the copy is hidden from screen readers. */}
                <div className="marquee-track flex w-max gap-2">
                  {[0, 1].map((copy) =>
                    loanPartners.map((b) => (
                      <span
                        key={`${copy}-${b}`}
                        aria-hidden={copy === 1}
                        className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm font-semibold whitespace-nowrap text-navy-800"
                      >
                        <Landmark className="size-4 text-gold-600" aria-hidden /> {b}
                      </span>
                    )),
                  )}
                </div>
              </div>
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
