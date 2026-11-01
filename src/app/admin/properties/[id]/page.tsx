import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/skeletons";
import { deleteProperty } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Property } from "@/lib/types";
import { PageHeader } from "../../page-header";
import { SetupNotice } from "../../setup-notice";
import { DeletePropertyButton, PropertyForm } from "../property-form";

export const metadata: Metadata = { title: "Edit property" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditPropertyPage({ params }: PageProps<"/admin/properties/[id]">) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <Suspense fallback={<FormSkeleton label="Loading property" />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/properties/[id]">, "params">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  if (id === "new") {
    return (
      <div className="space-y-8">
        <PageHeader title="Add property" description="Fill in the details below. You can save it hidden and publish later." />
        <PropertyForm />
      </div>
    );
  }
  if (!UUID.test(id)) notFound();

  const { data } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const property = data as Property;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/properties" className="inline-flex h-10 items-center text-sm text-slate-500 hover:text-navy-900">← All properties</Link>
        <PageHeader title={property.name} description="Changes go live on the website as soon as you save.">
          {property.published && (
            <Link href={`/properties/${property.slug}`} target="_blank" rel="noopener" className="btn-outline">
              <ExternalLink className="size-4" aria-hidden /> Preview on site
            </Link>
          )}
        </PageHeader>
      </div>
      <PropertyForm property={property} />
      <form action={deleteProperty} className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8">
        <input type="hidden" name="id" value={property.id} />
        <p className="text-sm text-red-800">
          Deleting removes this property from the website permanently. Leads that mention it are kept. To hide it
          temporarily, untick <strong>Published</strong> instead.
        </p>
        <DeletePropertyButton />
      </form>
    </div>
  );
}
