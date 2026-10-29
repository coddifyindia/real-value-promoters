export const PROPERTY_TYPES = ["plot", "villa", "plot_villa", "farm_land"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  plot: "Plot",
  villa: "Villa",
  plot_villa: "Plot & Villa",
  farm_land: "Farm Land",
};

export type Property = {
  id: string;
  legacy_id: number | null;
  slug: string;
  name: string;
  location: string;
  city: string;
  type: PropertyType;
  price_label: string;
  price_from: number | null;
  description: string;
  amenities: string[];
  images: string[];
  contact_name: string | null;
  contact_phones: string[];
  youtube_id: string | null;
  map_embed_url: string | null;
  instagram_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  updated_at: string;
};

export const LEAD_KINDS = ["contact", "enquiry", "site_visit"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export const LEAD_STATUSES = ["new", "contacted", "site_visit_booked", "closed", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_KIND_LABELS: Record<LeadKind, string> = {
  contact: "Contact form",
  enquiry: "Property enquiry",
  site_visit: "Site visit request",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  site_visit_booked: "Site visit booked",
  closed: "Closed",
  spam: "Spam",
};

export type Lead = {
  id: string;
  created_at: string;
  kind: LeadKind;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  property_id: string | null;
  property_name: string | null;
  preferred_date: string | null;
  source_path: string | null;
  utm: Record<string, string> | null;
  notes: string | null;
};
