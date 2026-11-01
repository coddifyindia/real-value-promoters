import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Plots & Villas in Coimbatore, Trichy & Madurai`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "plots for sale in Coimbatore",
    "DTCP approved plots",
    "RERA approved plots",
    "villas in Coimbatore",
    "plots in Trichy",
    "plots in Madurai",
    "farm land Pollachi",
    "Real Value Promoters",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    images: [{ url: "/images/properties/diamond-avenue/01.webp", width: 1600, height: 1200 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
};

const organization = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: `${site.url}/images/brand/logo.png`,
  email: site.email,
  telephone: site.phone.tel,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  areaServed: ["Coimbatore", "Trichy", "Madurai", "Erode", "Pollachi"],
  sameAs: Object.values(site.social),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <JsonLd data={organization} />
        {/* The analytics script is served by Vercel's edge; skip it elsewhere (local, CI). */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
