import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyGrid } from "@/components/property-card";
import { PropertyExplorer } from "@/components/property-explorer";
import { SectionHeading } from "@/components/section-heading";
import { getCities, getPublishedProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Plots, Villas & Farm Land for Sale",
  description:
    "Browse DTCP & RERA approved plots, villas and farm land for sale in Coimbatore, Trichy, Madurai, Erode and Pollachi. Filter by city, type and price.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage() {
  const properties = await getPublishedProperties();
  const cities = getCities(properties);

  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Our projects"
        title="Find your perfect plot"
        description="Gated communities, villa plots and farm land in Tamil Nadu's fastest-growing corridors."
      />
      <div className="mt-10">
        {/* Filters read the URL, so they hydrate after the prerendered list. */}
        <Suspense fallback={<PropertyGrid properties={properties} priorityCount={3} />}>
          <PropertyExplorer properties={properties} cities={cities} />
        </Suspense>
      </div>
    </div>
  );
}
