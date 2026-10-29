import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/brand/logo.png";
import { site } from "@/lib/site";

export function Logo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`${site.name} home`}>
      <Image src={logo} alt={site.legalName} className={className} priority sizes="160px" />
    </Link>
  );
}
