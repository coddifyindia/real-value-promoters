import type { ReactNode } from "react";

/** One header layout for every admin page: title, a plain-English line on what the page is for, and actions. */
export function PageHeader({
  title,
  description,
  meta,
  children,
}: {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-slate-200 pb-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 leading-relaxed text-slate-600">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap gap-2 text-sm">{meta}</div>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

/** Small count pill used in page headers. */
export function Stat({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "blue" | "green" }) {
  const tones = {
    slate: "bg-white text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-800 ring-blue-200",
    green: "bg-green-50 text-green-800 ring-green-200",
  };
  return <span className={`inline-flex h-8 items-center rounded-full px-3 font-medium ring-1 ${tones[tone]}`}>{children}</span>;
}
