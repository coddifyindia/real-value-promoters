export const site = {
  name: "Real Value Promoters",
  legalName: "Real Value Land Promoters and Builders",
  tagline: "Premium plots, villas and farm land across Tamil Nadu",
  description:
    "DTCP & RERA approved plots, villas and farm land in Coimbatore, Trichy, Madurai, Erode and Pollachi. Transparent documentation, bank loan assistance and free site visits.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.realvaluepromoters.com",
  email: "realvaluelandpromoters@gmail.com",
  phone: { display: "+91 96556 69675", tel: "+919655669675" },
  whatsapp: { display: "+91 90430 69675", number: "919043069675" },
  address: {
    street: "Real Value Enclave, Ground Floor, Opp. to Panchayath Office, Pattanam",
    locality: "Coimbatore",
    region: "Tamil Nadu",
    postalCode: "641016",
    country: "IN",
  },
  social: {
    instagram: "https://www.instagram.com/realvaluelandpromoters",
    facebook: "https://www.facebook.com/share/18p8qf61qM/",
    youtube: "https://youtube.com/@realvaluelandpromoters",
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `91${digits}` : digits}`;
}
