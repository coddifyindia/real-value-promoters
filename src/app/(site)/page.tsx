import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Car,
  FileCheck2,
  Handshake,
  House,
  Landmark,
  MapPin,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WithIcon } from "@/components/field";
import { HeroVideo } from "@/components/hero-video";
import { IntroCurtain } from "@/components/intro-curtain";
import { LeadForm } from "@/components/lead-form";
import { Magnetic, SplitText } from "@/components/motion";
import { CityIndex } from "@/components/city-index";
import { ProjectGallery } from "@/components/project-gallery";
import { SectionHeading } from "@/components/section-heading";
import { getCities, getPublishedProperties } from "@/lib/properties";
import { getHeroVideo } from "@/lib/site-settings";
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

const bandWords = ["Gated plots", "Villas", "Farm land", "DTCP approved", "Bank loans", "Free site visits"];

const loanPartners = ["SBI", "HDFC Bank", "LIC Housing Finance", "Tata Capital"];

function heroStats(projects: number, cities: number) {
  return [
    { value: projects, suffix: "", label: "Live projects" },
    { value: cities, suffix: "", label: "Cities in Tamil Nadu" },
    { value: 85, suffix: "%", label: "Bank loan support" },
  ];
}

const steps = [
  { title: "Shortlist", text: "Tell us your budget and preferred area. We'll suggest the right projects." },
  { title: "Visit the site", text: "See the layout in person. We arrange pickup and walk you through it." },
  { title: "Loan & documents", text: "We help with bank loan approval and verify every document with you." },
  { title: "Register & own", text: "Complete registration and get your land, with support after you buy." },
];

export default async function HomePage() {
  const [properties, heroVideo] = await Promise.all([getPublishedProperties(), getHeroVideo()]);
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
      <IntroCurtain />

      {/* Hero: the client's video fills the banner, darkened under the copy. */}
      <section id="hero" className="relative bg-navy-950">
        <div className="relative isolate flex min-h-[92svh] flex-col overflow-hidden lg:min-h-[720px]">
          <div className="hero-parallax absolute inset-0 -z-20">
            <HeroVideo {...heroVideo} />
          </div>
          {/* Legibility: dark under the copy, lighter where the video shows through. */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/30 lg:bg-gradient-to-r lg:from-navy-950/90 lg:via-navy-950/45 lg:to-navy-950/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy-950 to-transparent" />

          <div className="hero-fade container-x flex flex-1 flex-col justify-end pt-24 pb-10 sm:pb-14 lg:justify-center lg:pt-16 lg:pb-16">
            <p className="enter inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md" style={{ "--d": 0 } as React.CSSProperties}>
              <Sparkles className="size-3.5 text-gold-300" aria-hidden />
              DTCP &amp; RERA approved · {properties.length} live projects
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.1] text-white sm:text-6xl sm:leading-[1.08] xl:text-7xl">
              <SplitText on="load" delay={2} text="Own land you can be proud of, in places that" />{" "}
              <SplitText
                on="load"
                delay={11}
                text="keep growing."
                wordClassName="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text pr-1 text-transparent italic"
              />
            </h1>
            <p className="enter mt-5 max-w-xl text-base text-white/80 sm:text-lg" style={{ "--d": 2 } as React.CSSProperties}>
              Gated plots, villas and farm land across Coimbatore, Trichy, Madurai, Erode and Pollachi, with clear
              documents, bank loans and free site visits.
            </p>

            <form
              action="/properties"
              className="enter mt-8 grid max-w-2xl gap-2 rounded-3xl border border-white/20 bg-white/10 p-2 shadow-lift backdrop-blur-xl sm:grid-cols-[1fr_1fr_auto]"
              style={{ "--d": 3 } as React.CSSProperties}
            >
              <label>
                <span className="sr-only">City</span>
                <WithIcon icon={MapPin}>
                  <select name="city" className="field field-lg field-icon select-field border-transparent">
                    <option value="">Any city</option>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </WithIcon>
              </label>
              <label>
                <span className="sr-only">Property type</span>
                <WithIcon icon={House}>
                  <select name="type" className="field field-lg field-icon select-field border-transparent">
                    <option value="">Any type</option>
                    <option value="plot">Plot</option>
                    <option value="villa">Villa</option>
                    <option value="farm_land">Farm Land</option>
                  </select>
                </WithIcon>
              </label>
              <button type="submit" className="btn-gold btn-lg">
                <Search className="size-5" aria-hidden /> Find properties
              </button>
            </form>

            <dl className="enter mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6" style={{ "--d": 4 } as React.CSSProperties}>
              {heroStats(properties.length, cities.length).map(({ value, suffix, label }) => (
                <div key={label} className="flex flex-col px-3 first:pl-0 sm:px-6">
                  <dt className="order-2 text-xs text-white/60 sm:text-sm">{label}</dt>
                  <dd className="font-display text-2xl text-white tabular-nums sm:text-4xl">
                    <span className="sr-only">
                      {value}
                      {suffix}
                    </span>
                    {/* Counts up from 0 in CSS; the real number above is what screen readers hear. */}
                    <span aria-hidden className="count-up" style={{ "--to": value } as React.CSSProperties} />
                    <span aria-hidden>{suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </section>

      {/* Trust facts */}
      <section aria-label="Why buyers trust us" className="border-b border-navy-900/10 bg-sand-50">
        <ul className="container-x grid grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className={`reveal flex items-start gap-3 py-7 lg:py-9 ${i % 2 ? "border-l border-navy-900/10 pl-4 sm:pl-6" : "pr-4"} ${i > 0 ? "lg:border-l lg:border-navy-900/10 lg:pl-8" : ""}`}
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-navy-900 sm:text-base">{title}</p>
                <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Signature projects: pinned horizontal gallery */}
      <ProjectGallery properties={featured} total={properties.length} />

      {/* Cities: large-type index with a cursor-following preview */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">Where we build</p>
            <h2 className="mt-2 text-4xl leading-[1.05] sm:text-5xl">
              <SplitText text="Five cities. One standard." />
            </h2>
            <p className="mt-5 max-w-sm text-slate-600">
              Every layout sits on a growth corridor: near highways, bypasses, colleges and new bus stands. Pick a city
              to see what&apos;s open.
            </p>
          </div>
          <CityIndex cities={cityTiles} />
        </div>
      </section>

      {/* Why us: editorial statement + numbered reasons */}
      <section className="bg-sand-50 py-20 sm:py-32">
        <div className="container-x">
          <p className="eyebrow">Why Real Value</p>
          <p className="mt-4 max-w-5xl font-display text-3xl leading-[1.2] text-navy-900 sm:text-5xl sm:leading-[1.15] lg:text-6xl">
            <SplitText text="We sell land the way we'd want to buy it:" />{" "}
            <SplitText text="approved, documented and explained." wordClassName="text-gold-600 italic" delay={8} />
          </p>
          <ol className="mt-16 grid gap-x-12 sm:mt-20 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
            {reasons.map(({ title, text }, i) => (
              <li key={title} className="reveal group border-t border-navy-900/15 pt-6 pb-10">
                <span className="block font-display text-5xl leading-none text-gold-600 tabular-nums transition-colors group-hover:text-gold-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-2xl leading-snug transition-colors group-hover:text-brand-700">{title}</h3>
                <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Process */}
      <section className="relative isolate overflow-clip bg-navy-900 py-16 text-white sm:py-24">
        <div className="absolute -top-40 -right-40 -z-10 size-[30rem] rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-40 -z-10 size-[30rem] rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
          {/* On large screens the heading stays put while the step cards stack over each other. */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow text-gold-300">How it works</p>
            <h2 className="mt-2 text-3xl text-white sm:text-5xl">
              <SplitText text="From first call to registration" />
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              One team from shortlist to sale deed. No middlemen, no surprises, and help after you buy.
            </p>
            <Magnetic>
              <Link href="/contact#enquire" className="btn-gold mt-8 px-7">
                Start with a free site visit <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Magnetic>
          </div>
          <ol className="space-y-6">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-3xl border border-white/10 bg-navy-800/95 p-7 shadow-2xl shadow-navy-950/40 backdrop-blur sm:p-9 lg:sticky"
                style={{ top: `calc(8rem + ${i * 1.75}rem)` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-5xl leading-none text-gold-400 tabular-nums sm:text-6xl">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-2 text-xs tracking-[0.2em] text-white/60 uppercase">
                    Step {i + 1} of {steps.length}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl text-white">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-white/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Big type band */}
      <section aria-label="What we offer" className="overflow-hidden border-b border-navy-900/10 bg-sand-50 py-8 sm:py-12">
        <div className="marquee [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-10 font-display text-6xl leading-[1.2] whitespace-nowrap text-navy-900 sm:text-8xl sm:leading-[1.2]">
            {[0, 1].map((copy) =>
              bandWords.map((w, i) => (
                <span key={`${copy}-${w}`} aria-hidden={copy === 1} className="flex items-center gap-10">
                  <span className={i % 2 ? "outline-type" : ""}>{w}</span>
                  <Sparkles className="size-8 shrink-0 text-gold-400 sm:size-12" aria-hidden />
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      {/* Testimonials + partners */}
      <section className="py-14 sm:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Happy families" title="What our buyers say" />
          <div className="mt-14 grid gap-x-12 gap-y-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="reveal flex flex-col border-t border-navy-900/15 pt-8">
                <span aria-hidden className="font-display text-7xl leading-[0.5] text-gold-400">&ldquo;</span>
                <blockquote className="mt-4 flex-1 font-display text-2xl leading-snug text-navy-900">{t.quote}</blockquote>
                <figcaption className="mt-8 text-sm">
                  <span className="font-semibold text-navy-900">{t.name}</span>
                  <span className="text-slate-500"> · {t.role}</span>
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
        {/* The photo column stretches to the form's height, so both columns end on one line. */}
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col">
            <SectionHeading
              align="left"
              eyebrow="Talk to us"
              title="Book a free site visit"
              description="Share a few details and our team will call you within one working day with options that fit your budget. Pickup is on us."
            />
            <div data-reveal="clip" className="relative mt-8 hidden min-h-72 flex-1 overflow-hidden rounded-3xl lg:block">
              <Image
                src="/images/properties/golden-farms/01.webp"
                alt="Aerial view of Real Value Golden Farms near Pollachi"
                fill
                sizes="(min-width: 1280px) 600px, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-6 pt-16 text-white">
                <p className="font-display text-xl">Golden Farms, Pollachi</p>
                <p className="mt-1 text-sm text-white/75">Free pickup and drop for every site visit</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-sand-50 p-6 ring-1 ring-slate-200 sm:p-10">
            <h3 className="text-2xl">Tell us what you&apos;re looking for</h3>
            <p className="mt-1 mb-7 text-sm text-slate-600">Takes under a minute. No spam, ever.</p>
            <LeadForm defaultKind="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
