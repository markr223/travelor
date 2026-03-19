"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays, Users, Search, ExternalLink } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import type { LocationResult } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

interface BookingHotelWidgetProps {
  bookingAid?: string;
  initialDestination?: string;
}

export function BookingHotelWidget({
  bookingAid,
  initialDestination = "",
}: BookingHotelWidgetProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>(addDays(new Date(), 7));
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 10));
  const [guests, setGuests] = useState("2");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/hotels/lookup?query=${encodeURIComponent(q)}&limit=5`
      );
      const data = await res.json();
      if (data.results?.locations) {
        setSuggestions(data.results.locations);
        setShowSuggestions(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(destination), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [destination, fetchSuggestions]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch() {
    const ss = encodeURIComponent(destination);
    const ci = format(checkIn, "yyyy-MM-dd");
    const co = format(checkOut, "yyyy-MM-dd");
    const aid = bookingAid || "";
    const url = `https://www.booking.com/searchresults.html?ss=${ss}&checkin=${ci}&checkout=${co}&group_adults=${guests}&no_rooms=1${aid ? `&aid=${aid}` : ""}`;
    window.open(url, "_blank");
  }

  return (
    <div className="w-full bg-card rounded-2xl shadow-xl border p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
        <Search className="h-5 w-5 text-primary" />
        Search Hotels
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto_auto] gap-2 sm:gap-3 items-end">
        {/* Destination */}
        <div className="relative col-span-2 md:col-span-1" ref={ref}>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="City or hotel name..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() =>
                suggestions.length > 0 && setShowSuggestions(true)
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10 sm:h-9"
            />
          </div>
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease }}
                className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-64 overflow-auto"
              >
                {suggestions.map((loc, i) => (
                  <motion.button
                    key={loc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2"
                    onClick={() => {
                      setDestination(loc.cityName);
                      setShowSuggestions(false);
                    }}
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{loc.cityName}</div>
                      <div className="text-xs text-muted-foreground">
                        {loc.countryName}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Check-in */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Check-in
          </label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger className="inline-flex w-full items-center justify-start rounded-lg border border-border bg-background px-3 h-10 sm:h-9 text-sm hover:bg-muted transition-colors">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              {format(checkIn, "MMM d")}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  if (d) {
                    setCheckIn(d);
                    setCheckInOpen(false);
                    if (d >= checkOut) setCheckOut(addDays(d, 1));
                  }
                }}
                disabled={(d) => d < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Check-out
          </label>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger className="inline-flex w-full items-center justify-start rounded-lg border border-border bg-background px-3 h-10 sm:h-9 text-sm hover:bg-muted transition-colors">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              {format(checkOut, "MMM d")}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => {
                  if (d) {
                    setCheckOut(d);
                    setCheckOutOpen(false);
                  }
                }}
                disabled={(d) => d <= checkIn}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              max={10}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="pl-10 w-full sm:w-20 h-10 sm:h-9"
            />
          </div>
        </div>

        {/* Search */}
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs font-medium text-transparent mb-1 hidden md:block">
            &nbsp;
          </label>
          <Button onClick={handleSearch} className="w-full sm:w-auto h-11 sm:h-9">
            <Search className="mr-2 h-4 w-4" />
            Search Hotels
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
        <ExternalLink className="h-3 w-3" />
        Hotel search powered by Booking.com. Results open in a new tab.
      </p>
    </div>
  );
}
