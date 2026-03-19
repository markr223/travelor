import { Suspense } from "react";
import { FlightSearchBar } from "@/components/FlightSearchBar";
import { FlightResults } from "@/components/FlightResults";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Flights - Travelor",
  description:
    "Compare flight prices and find the cheapest flights worldwide.",
};

export default async function FlightsPage({
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <FlightSearchBar
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

      <Suspense
        fallback={
          <div className="text-center py-16 text-muted-foreground">
            Loading flight results...
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
          cabinClass={0}
        />
      </Suspense>
    </div>
  );
}
