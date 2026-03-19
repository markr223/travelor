"use client";

import { useState } from "react";
import { Plane, Hotel, Crown } from "lucide-react";
import { FlightSearchBar } from "@/components/FlightSearchBar";
import { BookingHotelWidget } from "@/components/BookingHotelWidget";

type Tab = "flights" | "premium" | "hotels";

export function HomeSearch() {
  const [tab, setTab] = useState<Tab>("flights");

  const tabs: { id: Tab; label: string; icon: typeof Plane; premium?: boolean }[] = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "premium", label: "Premium", icon: Crown, premium: true },
    { id: "hotels", label: "Hotels", icon: Hotel },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center gap-0.5 sm:gap-1 mb-4 px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === t.id
                ? t.premium
                  ? "bg-gray-900 text-amber-400 border border-b-0 border-amber-500/30 shadow-lg shadow-amber-500/5"
                  : "bg-card text-foreground border border-b-0 shadow-sm"
                : t.premium
                  ? "bg-transparent text-amber-500/60 hover:text-amber-400"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "premium" ? (
        <div className="bg-gray-950 rounded-2xl p-1">
          <FlightSearchBar premium />
        </div>
      ) : tab === "hotels" ? (
        <BookingHotelWidget />
      ) : (
        <FlightSearchBar />
      )}
    </div>
  );
}
