"use client";

import { MessageSquareText, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { WhatsAppIcon } from "./icons";
import { site, whatsappLink } from "@/lib/site";

// Always-visible contact actions on phones, where most visitors arrive.
export function MobileActionBar() {
  return (
    <Suspense fallback={<ActionBarView onProperty={false} />}>
      <ActionBarWithPath />
    </Suspense>
  );
}

function ActionBarWithPath() {
  // Property and shortlist pages have their own enquiry form; send visitors there instead of /contact.
  const path = usePathname();
  return <ActionBarView onProperty={path.startsWith("/properties/") || path === "/shortlist"} />;
}

function ActionBarView({ onProperty }: { onProperty: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-3">
        <a href={`tel:${site.phone.tel}`} className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-navy-900">
          <Phone className="size-5" aria-hidden /> Call
        </a>
        <a
          href={whatsappLink("Hi, I'd like to know more about your properties.")}
          className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-whatsapp"
        >
          <WhatsAppIcon className="size-5" /> WhatsApp
        </a>
        <Link href={onProperty ? "#enquire" : "/contact#enquire"} className="flex flex-col items-center gap-0.5 bg-brand-600 py-2.5 text-xs font-medium text-white">
          <MessageSquareText className="size-5" aria-hidden /> Enquire
        </Link>
      </div>
    </div>
  );
}
