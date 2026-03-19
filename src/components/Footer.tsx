import Link from "next/link";
import { Plane } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <StaggerContainer
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.1}
        >
          <StaggerItem direction="up">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Travelor</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Find the cheapest flights and best hotel deals worldwide.
                Compare prices from hundreds of travel sites.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem direction="up">
            <div>
              <h3 className="text-sm font-semibold mb-3">Search</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/flights"
                    className="hover:text-foreground transition-colors"
                  >
                    Search Flights
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hotels"
                    className="hover:text-foreground transition-colors"
                  >
                    Search Hotels
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations"
                    className="hover:text-foreground transition-colors"
                  >
                    Destinations
                  </Link>
                </li>
              </ul>
            </div>
          </StaggerItem>

          <StaggerItem direction="up">
            <div>
              <h3 className="text-sm font-semibold mb-3">Popular Flights</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/flights?origin=LON&originName=London&destination=PAR&destinationName=Paris"
                    className="hover:text-foreground transition-colors"
                  >
                    London to Paris
                  </Link>
                </li>
                <li>
                  <Link
                    href="/flights?origin=NYC&originName=New+York&destination=LON&destinationName=London"
                    className="hover:text-foreground transition-colors"
                  >
                    New York to London
                  </Link>
                </li>
                <li>
                  <Link
                    href="/flights?origin=LON&originName=London&destination=DXB&destinationName=Dubai"
                    className="hover:text-foreground transition-colors"
                  >
                    London to Dubai
                  </Link>
                </li>
              </ul>
            </div>
          </StaggerItem>

          <StaggerItem direction="up">
            <div>
              <h3 className="text-sm font-semibold mb-3">Powered By</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Flights by Aviasales</li>
                <li>Hotels by Booking.com</li>
                <li>Data by Travelpayouts</li>
              </ul>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <FadeIn delay={0.4} direction="none">
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Travelor. All rights reserved.
            Prices shown may change. Final price confirmed at booking.
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
