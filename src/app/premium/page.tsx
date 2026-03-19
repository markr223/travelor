import { Suspense } from "react";
import { FlightSearchBar } from "@/components/FlightSearchBar";
import { FlightResults } from "@/components/FlightResults";
import { Crown, Star, Shield, Gem } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium & First Class Flights - Travelor",
  description:
    "Find Business and First Class flights at the best prices. Luxury travel made affordable.",
};

const PERKS = [
  { icon: Crown, label: "Priority Boarding" },
  { icon: Star, label: "Lie-flat Seats" },
  { icon: Shield, label: "Lounge Access" },
  { icon: Gem, label: "Premium Dining" },
];

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const origin = params.origin || "";
  const originName = params.originName || "";
  const destination = params.destination || "";
  const destinationName = params.destinationName || "";
  const departDate = params.departDate || "";
  const returnDate = params.returnDate || "";
  const passengers = params.passengers || "1";
  const tripType = (params.tripType as "round" | "oneway") || "round";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 animate-shimmer" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Premium Experience</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Business & First Class
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Fly in luxury. Compare premium cabin prices from hundreds of airlines worldwide.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {PERKS.map((perk) => (
                <div
                  key={perk.label}
                  className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2"
                >
                  <perk.icon className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-gray-300">{perk.label}</span>
                </div>
              ))}
            </div>
          </div>

          <FlightSearchBar
            premium
            initialOrigin={originName}
            initialOriginCode={origin}
            initialDestination={destinationName}
            initialDestinationCode={destination}
            initialDepartDate={departDate}
            initialReturnDate={returnDate}
            initialPassengers={passengers}
            initialTripType={tripType}
          />
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense
          fallback={
            <div className="text-center py-16 text-gray-500">
              Searching premium flights...
            </div>
          }
        >
          <FlightResults
            origin={origin}
            originName={originName}
            destination={destination}
            destinationName={destinationName}
            departDate={departDate}
            returnDate={tripType === "round" ? returnDate : ""}
            cabinClass={1}
            premium
          />
        </Suspense>
      </div>
    </div>
  );
}
