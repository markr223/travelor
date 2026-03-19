import { Skeleton } from "@/components/ui/skeleton";

export default function FlightsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <Skeleton className="h-40 w-full rounded-2xl mb-8" />
      <Skeleton className="h-8 w-64 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
