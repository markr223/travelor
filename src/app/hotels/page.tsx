import { BookingHotelWidget } from "@/components/BookingHotelWidget";
import { DestinationCard } from "@/components/DestinationCard";
import type { Metadata } from "next";
import {
  FadeIn,
  HeroText,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

export const metadata: Metadata = {
  title: "Search Hotels - Travelor",
  description:
    "Find and compare hotel prices from Booking.com. Search hotels worldwide.",
};

const HOTEL_DESTINATIONS = [
  { name: "Paris", country: "France", iata: "PAR" },
  { name: "London", country: "United Kingdom", iata: "LON" },
  { name: "Dubai", country: "UAE", iata: "DXB" },
  { name: "Bangkok", country: "Thailand", iata: "BKK" },
  { name: "Rome", country: "Italy", iata: "ROM" },
  { name: "Barcelona", country: "Spain", iata: "BCN" },
  { name: "Istanbul", country: "Turkey", iata: "IST" },
  { name: "New York", country: "USA", iata: "NYC" },
];

export default function HotelsPage() {
  const bookingAid = process.env.BOOKING_AID || "";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <HeroText>
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Hotel</h1>
        </HeroText>
        <HeroText delay={0.12}>
          <p className="text-muted-foreground">
            Compare hotel prices on Booking.com and find the best deals worldwide
          </p>
        </HeroText>
      </div>

      <FadeIn delay={0.25} direction="scale-up">
        <div className="mb-12">
          <BookingHotelWidget bookingAid={bookingAid} />
        </div>
      </FadeIn>

      <FadeIn direction="up">
        <h2 className="text-2xl font-bold mb-5 text-center">
          Popular Hotel Destinations
        </h2>
      </FadeIn>
      <StaggerContainer
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        staggerDelay={0.08}
      >
        {HOTEL_DESTINATIONS.map((dest) => (
          <StaggerItem key={dest.iata} direction="scale-up">
            <DestinationCard
              name={dest.name}
              country={dest.country}
              iata={dest.iata}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
