import { DestinationCard } from "@/components/DestinationCard";
import type { Metadata } from "next";
import {
  FadeIn,
  HeroText,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

export const metadata: Metadata = {
  title: "Destinations - Travelor",
  description:
    "Browse popular travel destinations worldwide and find flights and hotels.",
};

const REGIONS = [
  {
    name: "Europe",
    destinations: [
      { name: "Paris", country: "France", iata: "PAR" },
      { name: "London", country: "United Kingdom", iata: "LON" },
      { name: "Rome", country: "Italy", iata: "ROM" },
      { name: "Barcelona", country: "Spain", iata: "BCN" },
      { name: "Amsterdam", country: "Netherlands", iata: "AMS" },
      { name: "Prague", country: "Czech Republic", iata: "PRG" },
      { name: "Vienna", country: "Austria", iata: "VIE" },
      { name: "Berlin", country: "Germany", iata: "BER" },
    ],
  },
  {
    name: "Asia & Middle East",
    destinations: [
      { name: "Dubai", country: "UAE", iata: "DXB" },
      { name: "Bangkok", country: "Thailand", iata: "BKK" },
      { name: "Tokyo", country: "Japan", iata: "TYO" },
      { name: "Singapore", country: "Singapore", iata: "SIN" },
      { name: "Istanbul", country: "Turkey", iata: "IST" },
      { name: "Bali", country: "Indonesia", iata: "DPS" },
      { name: "Phuket", country: "Thailand", iata: "HKT" },
      { name: "Hong Kong", country: "China", iata: "HKG" },
    ],
  },
  {
    name: "Americas",
    destinations: [
      { name: "New York", country: "USA", iata: "NYC" },
      { name: "Miami", country: "USA", iata: "MIA" },
      { name: "Cancun", country: "Mexico", iata: "CUN" },
      { name: "Los Angeles", country: "USA", iata: "LAX" },
    ],
  },
];

export default function DestinationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <HeroText>
          <h1 className="text-3xl font-bold mb-2">Explore Destinations</h1>
        </HeroText>
        <HeroText delay={0.12}>
          <p className="text-muted-foreground">
            Find flights and hotels in the world&apos;s most exciting destinations
          </p>
        </HeroText>
      </div>

      {REGIONS.map((region, regionIdx) => (
        <section key={region.name} className="mb-12">
          <FadeIn delay={regionIdx * 0.05} direction="left">
            <h2 className="text-2xl font-bold mb-5">{region.name}</h2>
          </FadeIn>
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            staggerDelay={0.07}
          >
            {region.destinations.map((dest) => (
              <StaggerItem key={dest.iata} direction="scale-up">
                <DestinationCard {...dest} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      ))}
    </div>
  );
}
