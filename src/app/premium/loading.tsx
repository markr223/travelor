import { Skeleton } from "@/components/ui/skeleton";
import { Crown } from "lucide-react";

export default function PremiumLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-8">
          <Crown className="h-8 w-8 text-amber-500/30 mx-auto mb-4" />
          <Skeleton className="h-10 w-80 mx-auto mb-3 bg-gray-800" />
          <Skeleton className="h-5 w-64 mx-auto bg-gray-800" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl mb-8 bg-gray-800" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl bg-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
