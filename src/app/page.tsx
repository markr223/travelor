import { HomeSearch } from "@/components/HomeSearch";
import { FlightDeals } from "@/components/FlightDeals";
import { DestinationCard } from "@/components/DestinationCard";
import { Plane, Hotel, Shield, DollarSign, Globe, Zap } from "lucide-react";
import {
  FadeIn,
  HeroText,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

const POPULAR_DESTINATIONS = [
  { name: "Paris", country: "France", iata: "PAR" },
  { name: "London", country: "United Kingdom", iata: "LON" },
  { name: "Dubai", country: "UAE", iata: "DXB" },
  { name: "Bangkok", country: "Thailand", iata: "BKK" },
  { name: "Rome", country: "Italy", iata: "ROM" },
  { name: "Barcelona", country: "Spain", iata: "BCN" },
  { name: "Istanbul", country: "Turkey", iata: "IST" },
  { name: "New York", country: "USA", iata: "NYC" },
];

const FEATURES = [
  {
    icon: DollarSign,
    title: "Best Prices",
    desc: "Compare prices from hundreds of travel sites to find the lowest fares.",
  },
  {
    icon: Shield,
    title: "Trusted Partners",
    desc: "Book through Aviasales and Booking.com with secure payments.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    desc: "Flights and hotels in thousands of destinations worldwide.",
  },
  {
    icon: Zap,
    title: "Real-time Data",
    desc: "Live pricing and availability updated constantly.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <HeroText delay={0}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <FloatingElement delay={0} duration={2.5} distance={6}>
                <Plane className="h-8 w-8 text-primary" />
              </FloatingElement>
              <span className="text-2xl text-muted-foreground">&</span>
              <FloatingElement delay={0.5} duration={2.5} distance={6}>
                <Hotel className="h-8 w-8 text-primary" />
              </FloatingElement>
            </div>
          </HeroText>
          <HeroText delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Flights & Hotels{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-gradient">
                Made Simple
              </span>
            </h1>
          </HeroText>
          <HeroText delay={0.25}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Compare flight prices from hundreds of airlines. Find hotel deals on
              Booking.com. Everything you need for your perfect trip.
            </p>
          </HeroText>
          <HeroText delay={0.4}>
            <HomeSearch />
          </HeroText>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            staggerDelay={0.1}
          >
            {FEATURES.map((f) => (
              <StaggerItem key={f.title} direction="scale-up">
                <div className="text-center group">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Popular Destinations</h2>
            <p className="text-muted-foreground">
              Explore the world&apos;s most sought-after travel destinations
            </p>
          </FadeIn>
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            staggerDelay={0.08}
          >
            {POPULAR_DESTINATIONS.map((dest) => (
              <StaggerItem key={dest.iata} direction="scale-up">
                <DestinationCard {...dest} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Flight Deals */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Cheap Flight Deals</h2>
            <p className="text-muted-foreground">
              The latest flight deals found by our system
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <FlightDeals />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
