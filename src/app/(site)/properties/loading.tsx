import { Bone, CardGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <Bone className="h-3 w-28" />
        <Bone className="h-10 w-80 max-w-full" />
        <Bone className="h-5 w-96 max-w-full" />
      </div>
      <Bone className="mt-10 mb-8 h-16 w-full rounded-2xl" />
      <CardGridSkeleton />
    </div>
  );
}
