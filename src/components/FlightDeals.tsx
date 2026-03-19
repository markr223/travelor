"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { FlightPrice } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const ROUTES = [
  { origin: "LON", destination: "PAR", originName: "London", destName: "Paris" },
  { origin: "NYC", destination: "LON", originName: "New York", destName: "London" },
  { origin: "LON", destination: "BCN", originName: "London", destName: "Barcelona" },
  { origin: "LON", destination: "DXB", originName: "London", destName: "Dubai" },
  { origin: "LON", destination: "BKK", originName: "London", destName: "Bangkok" },
  { origin: "LON", destination: "IST", originName: "London", destName: "Istanbul" },
];

interface DealData {
  route: (typeof ROUTES)[0];
  flight: FlightPrice | null;
  loading: boolean;
}

export function FlightDeals() {
  const [deals, setDeals] = useState<DealData[]>(
    ROUTES.map((r) => ({ route: r, flight: null, loading: true }))
  );

  useEffect(() => {
    ROUTES.forEach((route, idx) => {
      fetch(
        `/api/flights/search?origin=${route.origin}&destination=${route.destination}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          setDeals((prev) => {
            const next = [...prev];
            next[idx] = {
              route,
              flight:
                data.success && data.data?.length > 0 ? data.data[0] : null,
              loading: false,
            };
            return next;
          });
        })
        .catch(() => {
          setDeals((prev) => {
            const next = [...prev];
            next[idx] = { route, flight: null, loading: false };
            return next;
          });
        });
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {deals.map((deal, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
            <CardContent className="p-5">
              {deal.loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-lg">
                      {deal.route.originName}
                    </span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                    <span className="font-bold text-lg">
                      {deal.route.destName}
                    </span>
                  </div>

                  {deal.flight ? (
                    <>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold text-primary mb-1"
                      >
                        ${Math.round(deal.flight.value)}
                      </motion.div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {deal.flight.number_of_changes === 0
                          ? "Direct flight"
                          : `${deal.flight.number_of_changes} stop${deal.flight.number_of_changes > 1 ? "s" : ""}`}
                        {deal.flight.airline && (
                          <>
                            {" \u00B7 "}
                            <img
                              src={`https://pics.avs.io/24/24/${deal.flight.airline}@2x.png`}
                              alt=""
                              className="inline h-4 w-4 -mt-0.5"
                            />
                            {" " + deal.flight.airline}
                          </>
                        )}
                      </div>
                      <a
                        href={`https://www.aviasales.com/search/${deal.route.origin}${deal.route.destination}1?marker=248072`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary font-medium hover:underline group/link"
                      >
                        <Plane className="h-3.5 w-3.5 mr-1 group-hover/link:animate-float" />
                        Find flights
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </>
                  ) : (
                    <a
                      href={`https://www.aviasales.com/search/${deal.route.origin}${deal.route.destination}1?marker=248072`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary font-medium hover:underline"
                    >
                      Search flights
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
