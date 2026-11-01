import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { ShortlistView } from "@/components/shortlist-view";
import { getPublishedProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Your shortlist",
  description: "Projects you've saved. Compare them side by side and enquire about all of them at once.",
  robots: { index: false },
};

export default async function ShortlistPage() {
  const properties = await getPublishedProperties();
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Your shortlist"
        title="Projects you've saved"
        description="Saved on this device. Compare them at a glance, then ask us about all of them in one go."
      />
      <div className="mt-10">
        <ShortlistView properties={properties} />
      </div>
    </div>
  );
}
