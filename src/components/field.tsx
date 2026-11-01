import { CircleAlert, type LucideIcon } from "lucide-react";

/** Puts a Lucide icon inside the left edge of a `field field-icon` input. */
export function WithIcon({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="group/field relative">
      <Icon
        className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within/field:text-brand-600"
        aria-hidden
      />
      {children}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-600">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
