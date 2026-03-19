"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  ArrowRightLeft,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import type { LocationResult } from "@/lib/types";

interface FlightSearchBarProps {
  initialOrigin?: string;
  initialOriginCode?: string;
  initialDestination?: string;
  initialDestinationCode?: string;
  initialDepartDate?: string;
  initialReturnDate?: string;
  initialPassengers?: string;
  initialTripType?: "round" | "oneway";
  premium?: boolean;
}

function CityInput({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  premium,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (loc: LocationResult) => void;
  premium?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/hotels/lookup?query=${encodeURIComponent(q)}&limit=6`
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
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className={`text-xs font-medium mb-1 block ${premium ? "text-amber-400/80" : "text-muted-foreground"}`}>
        {label}
      </label>
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${premium ? "text-amber-500/60" : "text-muted-foreground"}`} />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className={`pl-10 ${premium ? "bg-gray-800/50 border-amber-500/30 text-white placeholder:text-gray-500 focus:border-amber-400" : ""}`}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-50 top-full mt-1 w-full border rounded-lg shadow-lg max-h-64 overflow-auto ${premium ? "bg-gray-900 border-amber-500/20" : "bg-popover"}`}>
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 ${premium ? "hover:bg-amber-500/10 text-white" : "hover:bg-accent"}`}
              onClick={() => {
                onSelect(loc);
                setShowSuggestions(false);
              }}
            >
              <MapPin className={`h-4 w-4 shrink-0 ${premium ? "text-amber-500" : "text-primary"}`} />
              <div>
                <div className="text-sm font-medium">{loc.cityName}</div>
                <div className={`text-xs ${premium ? "text-gray-400" : "text-muted-foreground"}`}>
                  {loc.countryName}
                  {loc.iata?.[0] && ` (${loc.iata[0]})`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FlightSearchBar({
  initialOrigin = "",
  initialOriginCode = "",
  initialDestination = "",
  initialDestinationCode = "",
  initialDepartDate,
  initialReturnDate,
  initialPassengers = "1",
  initialTripType = "round",
  premium = false,
}: FlightSearchBarProps) {
  const router = useRouter();
  const [tripType, setTripType] = useState<"round" | "oneway">(initialTripType);
  const [originText, setOriginText] = useState(initialOrigin);
  const [originCode, setOriginCode] = useState(initialOriginCode);
  const [destText, setDestText] = useState(initialDestination);
  const [destCode, setDestCode] = useState(initialDestinationCode);
  const [departDate, setDepartDate] = useState<Date | undefined>(
    initialDepartDate ? new Date(initialDepartDate) : addDays(new Date(), 14)
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialReturnDate ? new Date(initialReturnDate) : addDays(new Date(), 21)
  );
  const [passengers, setPassengers] = useState(initialPassengers);
  const [departOpen, setDepartOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  function swap() {
    setOriginText(destText);
    setOriginCode(destCode);
    setDestText(originText);
    setDestCode(originCode);
  }

  async function handleSearch() {
    if (!originCode && !originText) return;
    if (!destCode && !destText) return;

    setSearching(true);

    let oCode = originCode;
    let dCode = destCode;

    if (!oCode && originText) {
      try {
        const res = await fetch(
          `/api/hotels/lookup?query=${encodeURIComponent(originText)}&limit=1`
        );
        const data = await res.json();
        if (data.results?.locations?.[0]) {
          oCode = data.results.locations[0].iata?.[0] || data.results.locations[0].id;
        }
      } catch { /* ignore */ }
    }
    if (!dCode && destText) {
      try {
        const res = await fetch(
          `/api/hotels/lookup?query=${encodeURIComponent(destText)}&limit=1`
        );
        const data = await res.json();
        if (data.results?.locations?.[0]) {
          dCode = data.results.locations[0].iata?.[0] || data.results.locations[0].id;
        }
      } catch { /* ignore */ }
    }

    const params = new URLSearchParams();
    params.set("origin", oCode || originText);
    params.set("originName", originText);
    params.set("destination", dCode || destText);
    params.set("destinationName", destText);
    if (departDate) params.set("departDate", format(departDate, "yyyy-MM-dd"));
    if (tripType === "round" && returnDate) params.set("returnDate", format(returnDate, "yyyy-MM-dd"));
    params.set("passengers", passengers);
    params.set("cabinClass", premium ? "1" : "0");
    params.set("tripType", tripType);

    setSearching(false);
    router.push(`${premium ? "/premium" : "/flights"}?${params}`);
  }

  const labelColor = premium ? "text-amber-400/80" : "text-muted-foreground";
  const triggerClass = premium
    ? "inline-flex w-full items-center justify-start rounded-lg border border-amber-500/30 bg-gray-800/50 px-3 h-10 sm:h-9 text-sm text-white hover:bg-gray-700/50 transition-colors"
    : "inline-flex w-full items-center justify-start rounded-lg border border-border bg-background px-3 h-10 sm:h-9 text-sm hover:bg-muted transition-colors";
  const calIconClass = premium ? "mr-2 h-4 w-4 text-amber-500/60" : "mr-2 h-4 w-4 text-muted-foreground";

  return (
    <div className={`w-full rounded-2xl shadow-xl p-4 md:p-6 ${
      premium
        ? "bg-gray-900/80 border border-amber-500/20 backdrop-blur-sm"
        : "bg-card border"
    }`}>
      <div className="flex items-center justify-between mb-4">
        {premium ? (
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Premium & First Class</span>
          </div>
        ) : <div />}

        {/* Round trip / One way toggle */}
        <div className={`inline-flex rounded-lg p-0.5 ${premium ? "bg-gray-800" : "bg-muted"}`}>
          <button
            onClick={() => setTripType("round")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              tripType === "round"
                ? premium
                  ? "bg-amber-500 text-black"
                  : "bg-background text-foreground shadow-sm"
                : premium
                  ? "text-gray-400 hover:text-amber-300"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Round trip
          </button>
          <button
            onClick={() => setTripType("oneway")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              tripType === "oneway"
                ? premium
                  ? "bg-amber-500 text-black"
                  : "bg-background text-foreground shadow-sm"
                : premium
                  ? "text-gray-400 hover:text-amber-300"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            One way
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-end mb-3">
        <CityInput
          label="From"
          placeholder="From..."
          value={originText}
          onChange={(v) => { setOriginText(v); setOriginCode(""); }}
          onSelect={(loc) => { setOriginText(loc.cityName); setOriginCode(loc.iata?.[0] || loc.id); }}
          premium={premium}
        />
        <div className="flex items-end justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={swap}
            className={`mb-0.5 h-8 w-8 sm:h-9 sm:w-9 ${premium ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" : ""}`}
            title="Swap cities"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
        <CityInput
          label="To"
          placeholder="To..."
          value={destText}
          onChange={(v) => { setDestText(v); setDestCode(""); }}
          onSelect={(loc) => { setDestText(loc.cityName); setDestCode(loc.iata?.[0] || loc.id); }}
          premium={premium}
        />
      </div>

      <div className={`grid gap-2 sm:gap-3 items-end ${
        tripType === "oneway"
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_auto_auto]"
          : "grid-cols-2 md:grid-cols-[1fr_1fr_auto_auto]"
      }`}>
        <div>
          <label className={`text-xs font-medium mb-1 block ${labelColor}`}>Depart</label>
          <Popover open={departOpen} onOpenChange={setDepartOpen}>
            <PopoverTrigger className={triggerClass}>
              <CalendarDays className={calIconClass} />
              {departDate ? format(departDate, "MMM d, yyyy") : "Select"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={(d) => {
                  setDepartDate(d);
                  setDepartOpen(false);
                  if (d && returnDate && d >= returnDate) setReturnDate(addDays(d, 7));
                }}
                disabled={(d) => d < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {tripType === "round" && (
          <div>
            <label className={`text-xs font-medium mb-1 block ${labelColor}`}>Return</label>
            <Popover open={returnOpen} onOpenChange={setReturnOpen}>
              <PopoverTrigger className={triggerClass}>
                <CalendarDays className={calIconClass} />
                {returnDate ? format(returnDate, "MMM d, yyyy") : "Select"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={(d) => { setReturnDate(d); setReturnOpen(false); }}
                  disabled={(d) => d < (departDate ? addDays(departDate, 1) : new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div>
          <label className={`text-xs font-medium mb-1 block ${labelColor}`}>Passengers</label>
          <div className="relative">
            <Users className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${premium ? "text-amber-500/60" : "text-muted-foreground"}`} />
            <Input
              type="number"
              min={1}
              max={9}
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className={`pl-10 w-full h-9 ${premium ? "bg-gray-800/50 border-amber-500/30 text-white" : ""}`}
            />
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="text-xs font-medium text-transparent mb-1 hidden md:block">&nbsp;</label>
          <Button
            onClick={handleSearch}
            disabled={searching}
            className={`w-full h-11 sm:h-10 md:h-9 ${
              premium
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                : ""
            }`}
          >
            {premium && <Crown className="mr-2 h-4 w-4" />}
            {!premium && <Search className="mr-2 h-4 w-4" />}
            {searching ? "Searching..." : premium ? "Search Premium" : "Search Flights"}
          </Button>
        </div>
      </div>
    </div>
  );
}
