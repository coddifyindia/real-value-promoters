import { CheckCircle2, ChevronRight, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { EmiCalculator } from "@/components/emi-calculator";
import { Gallery } from "@/components/gallery";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { PropertyGrid } from "@/components/property-card";
import { ShortlistButton } from "@/components/shortlist-button";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { getPropertyBySlug, getPublishedProperties } from "@/lib/properties";
import { site, telLink, whatsappLink } from "@/lib/site";
import { PROPERTY_TYPE_LABELS, type Property } from "@/lib/types";

// No generateStaticParams on purpose: prerendering each slug bakes the
// property list into the page, and the first visit after an admin edit would
// then be stale. Rendering per request from the "use cache" data (expired by
// updateTag on save) is still fast and always current.

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Property not found" };

  const title = `${property.name}, ${property.city} – ${PROPERTY_TYPE_LABELS[property.type]} from ${property.price_label}`;
  const description = `${property.description.slice(0, 150)}${property.description.length > 150 ? "…" : ""}`;
  return {
    title,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: { title, description, images: property.images.slice(0, 1) },
  };
}

export default function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  return (
    // The skeleton slides away and the real page slides up when it arrives
    // (React <ViewTransition>, see globals.css). Rendered per request, so
    // admin edits are visible on the very next visit.
    <Suspense
      fallback={
        <ViewTransition exit="slide-down" default="none">
          <PropertySkeleton />
        </ViewTransition>
      }
    >
      <ViewTransition enter="slide-up" default="none">
        <PropertyDetails params={params} />
      </ViewTransition>
    </Suspense>
  );
}

async function PropertyDetails({ params }: Pick<PageProps<"/properties/[slug]">, "params">) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = (await getPublishedProperties())
    .filter((p) => p.id !== property.id && (p.city === property.city || p.type === property.type))
    .slice(0, 3);

  const waText = `Hi, I'm interested in ${property.name} (${property.city}). Please share details.`;
  const facts = [
    ["Type", PROPERTY_TYPE_LABELS[property.type]],
    ["City", property.city],
    ["Starting price", property.price_label],
    ["Photos", String(property.images.length)],
  ];

  return (
    <>
      <div className="container-x pt-6 pb-16 sm:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-navy-900">Home</Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li>
              <Link href="/properties" className="hover:text-navy-900">Properties</Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li aria-current="page" className="text-slate-700">{property.name}</li>
          </ol>
        </nav>

        <header className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {PROPERTY_TYPE_LABELS[property.type]}
              </span>
              <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-navy-800">{property.city}</span>
            </div>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">{property.name}</h1>
            <p className="mt-2 flex items-start gap-1.5 text-slate-600">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden /> {property.location}
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 lg:flex-col lg:items-end">
            <div className="lg:text-right">
              <p className="text-sm text-slate-500">Starting from</p>
              <p className="font-display text-3xl text-brand-700">{property.price_label}</p>
            </div>
            <ShortlistButton slug={property.slug} name={property.name} variant="inline" />
          </div>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-12">
            <Gallery images={property.images} name={property.name} slug={property.slug} />

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-4">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-white p-4">
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="mt-1 font-semibold text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>

            <section>
              <h2 className="text-2xl">About this project</h2>
              <p className="mt-4 leading-relaxed whitespace-pre-line text-slate-700">{property.description}</p>
            </section>

            {property.amenities.length > 0 && (
              <section>
                <h2 className="text-2xl">Features &amp; amenities</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((a) => (
                    <li key={a} className="reveal flex items-start gap-3 rounded-xl bg-white p-3.5 ring-1 ring-slate-200">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
                      <span className="text-sm text-slate-700">{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {property.price_from ? <EmiCalculator price={property.price_from} propertyName={property.name} /> : null}

            {property.youtube_id && (
              <section>
                <h2 className="text-2xl">Video tour</h2>
                <div className="mt-5">
                  <YouTubeEmbed id={property.youtube_id} title={`${property.name} video tour`} />
                </div>
              </section>
            )}

            {property.map_embed_url && (
              <section>
                <h2 className="text-2xl">Location</h2>
                <div className="mt-5 aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-slate-200 sm:aspect-video">
                  <iframe
                    src={property.map_embed_url}
                    title={`Map showing ${property.name}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="size-full border-0"
                  />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start" id="enquire">
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
              <h2 className="text-xl">Interested in {property.name}?</h2>
              <p className="mt-1 mb-5 text-sm text-slate-600">Get the price list, layout plan and available plots.</p>
              <LeadForm property={{ slug: property.slug, name: property.name }} compact />
            </div>

            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <p className="text-sm text-white/70">Speak to the project manager</p>
              <p className="mt-1 font-display text-xl text-white">{property.contact_name ?? site.name}</p>
              <div className="mt-4 grid gap-2">
                {(property.contact_phones.length ? property.contact_phones : [site.phone.tel]).map((ph) => (
                  <a key={ph} href={telLink(ph)} className="btn-ghost-light justify-start">
                    <Phone className="size-4" aria-hidden /> {ph.replace(/^\+?91/, "").replace(/(\d{5})(\d{5})/, "$1 $2")}
                  </a>
                ))}
                <a href={whatsappLink(waText)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <WhatsAppIcon className="size-5" /> WhatsApp
                </a>
                {property.instagram_url && (
                  <a href={property.instagram_url} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
                    <InstagramIcon className="size-4" /> Watch on Instagram
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-x">
            <h2 className="text-3xl">You may also like</h2>
            <div className="mt-8">
              <PropertyGrid properties={similar} />
            </div>
          </div>
        </section>
      )}

      <JsonLd data={listingJsonLd(property)} />
    </>
  );
}

function listingJsonLd(p: Property) {
  const url = `${site.url}/properties/${p.slug}`;
  const abs = (src: string) => (src.startsWith("http") ? src : `${site.url}${src}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": url,
        url,
        name: p.name,
        description: p.description,
        image: p.images.slice(0, 6).map(abs),
        dateModified: p.updated_at,
        about: {
          "@type": "Place",
          name: p.name,
          address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: "Tamil Nadu", addressCountry: "IN", streetAddress: p.location },
          amenityFeature: p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })),
        },
        ...(p.price_from
          ? { offers: { "@type": "Offer", price: p.price_from, priceCurrency: "INR", availability: "https://schema.org/InStock" } }
          : {}),
        provider: { "@type": "RealEstateAgent", name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Properties", item: `${site.url}/properties` },
          { "@type": "ListItem", position: 3, name: p.name, item: url },
        ],
      },
    ],
  };
}

function PropertySkeleton() {
  return (
    <div className="container-x animate-pulse pt-8 pb-16" aria-busy="true" aria-label="Loading property">
      <div className="h-4 w-48 rounded bg-slate-200" />
      <div className="mt-6 h-10 w-2/3 rounded bg-slate-200" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="aspect-[16/10] rounded-2xl bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
