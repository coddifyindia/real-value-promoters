// Placeholders shaped like the content they stand in for, so nothing jumps
// when the real data arrives (no layout shift). The shimmer is CSS-only.

export function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function Loading({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-label={label} aria-busy="true" className={className}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, label = "Loading projects" }: { count?: number; label?: string }) {
  return (
    <Loading label={label} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
          <Bone className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <Bone className="h-6 w-2/3" />
            <Bone className="h-4 w-full" />
            <div className="flex items-end justify-between pt-3">
              <Bone className="h-8 w-28" />
              <Bone className="size-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </Loading>
  );
}

export function TableSkeleton({ rows = 6, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <Loading label={label} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Bone className="h-11 w-full sm:w-64" />
        <Bone className="h-11 w-32" />
        <Bone className="h-11 w-32" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-0">
            <Bone className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/3" />
              <Bone className="h-3 w-1/2" />
            </div>
            <Bone className="hidden h-7 w-24 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function FormSkeleton({ label = "Loading form" }: { label?: string }) {
  return (
    <Loading label={label} className="max-w-3xl space-y-5">
      <Bone className="h-9 w-1/2" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-4 w-28" />
          <Bone className="h-11 w-full" />
        </div>
      ))}
      <Bone className="h-32 w-full" />
    </Loading>
  );
}

export function PropertySkeleton() {
  return (
    <Loading label="Loading property" className="container-x pt-8 pb-16">
      <Bone className="h-4 w-48" />
      <Bone className="mt-6 h-6 w-32 rounded-full" />
      <Bone className="mt-4 h-11 w-2/3" />
      <Bone className="mt-3 h-5 w-1/2" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Bone className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/10]" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Bone key={i} className="aspect-[4/3] w-20 sm:w-24" />
            ))}
          </div>
        </div>
        <Bone className="h-[28rem] rounded-2xl" />
      </div>
    </Loading>
  );
}
