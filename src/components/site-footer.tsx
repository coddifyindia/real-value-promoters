import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/brand/logo.png";
import { NewsletterForm } from "./newsletter-form";
import { SocialLinks } from "./site-header";
import { WhatsAppIcon } from "./icons";
import { nav, site, whatsappLink } from "@/lib/site";

const cities = ["Coimbatore", "Trichy", "Madurai", "Erode", "Pollachi"];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy-950 pb-20 text-white/70 md:pb-0">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="inline-block rounded-xl bg-white p-3">
            <Image src={logo} alt={site.legalName} className="h-12 w-auto" sizes="160px" />
          </div>
          <p className="text-sm leading-relaxed">
            DTCP &amp; RERA approved plots, villas and farm land across Tamil Nadu, with clear documentation and
            bank loan support.
          </p>
          <div className="-ml-2 flex gap-1">
            <SocialLinks className="hover:bg-white/10 hover:text-white" />
          </div>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wider text-white uppercase">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 font-sans text-sm font-semibold tracking-wider text-white uppercase">Locations</h2>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {cities.map((c) => (
              <li key={c}>
                <Link
                  href={`/properties?city=${encodeURIComponent(c)}`}
                  className="inline-block rounded-full border border-white/15 px-3 py-1 hover:border-white/40 hover:text-white"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wider text-white uppercase">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
              <span>
                {site.address.street}, {site.address.locality} – {site.address.postalCode}
              </span>
            </li>
            <li>
              <a href={`tel:${site.phone.tel}`} className="flex gap-3 hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> {site.phone.display}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} className="flex gap-3 hover:text-white">
                <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-gold-400" /> {site.whatsapp.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 break-all hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wider text-white uppercase">New launches</h2>
          <p className="mt-4 mb-4 text-sm">Be first to hear about new projects and pre-launch prices.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {site.legalName}. All rights reserved.
          </p>
          <p>Prices and availability are indicative and subject to change.</p>
        </div>
      </div>
    </footer>
  );
}
