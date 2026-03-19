"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FlightCard } from "@/components/FlightCard";
import { FlightFilters, DEFAULT_FILTERS } from "@/components/FlightFilters";
import type { FlightFilterState } from "@/components/FlightFilters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plane, Crown, Loader2, Search, Radio, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LiveFlightProposal, LiveFlightGate } from "@/lib/types";
import { CABIN_CLASSES } from "@/lib/types";

function buildSegmentKey(proposal: LiveFlightProposal): string {
  return proposal.segments
    .map((leg) =>
      leg
        .map(
          (s) =>
            `${s.airline}${s.flightNumber}|${s.origin}${s.departureTime}-${s.destination}${s.arrivalTime}`
        )
        .join("/")
    )
    .join("||");
}

function deduplicateProposals(
  proposals: LiveFlightProposal[]
): LiveFlightProposal[] {
  const groups = new Map<string, LiveFlightProposal>();

  for (const p of proposals) {
    const key = buildSegmentKey(p);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, { ...p, gates: [...p.gates] });
      continue;
    }

    const seenGates = new Map<string, LiveFlightGate>();
    for (const g of existing.gates) {
      const gateKey = `${g.gateName}|${g.baggage.included}`;
      const prev = seenGates.get(gateKey);
      if (!prev || g.price < prev.price) {
        seenGates.set(gateKey, g);
      }
    }
    for (const g of p.gates) {
      const gateKey = `${g.gateName}|${g.baggage.included}`;
      const prev = seenGates.get(gateKey);
      if (!prev || g.price < prev.price) {
        seenGates.set(gateKey, g);
      }
    }

    const mergedGates = [...seenGates.values()].sort(
      (a, b) => a.price - b.price
    );
    existing.gates = mergedGates;
    existing.cheapestPrice = mergedGates[0]?.price ?? existing.cheapestPrice;
    existing.cheapestGate = mergedGates[0]?.gateName ?? existing.cheapestGate;
  }

  return [...groups.values()];
}

const ease = [0.22, 1, 0.36, 1] as const;

interface FlightResultsProps {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  departDate: string;
  returnDate: string;
  cabinClass: number;
  premium?: boolean;
}

export function FlightResults({
  origin,
  originName,
  destination,
  destinationName,
  departDate,
  returnDate,
  cabinClass,
  premium = false,
}: FlightResultsProps) {
  const [results, setResults] = useState<LiveFlightProposal[]>([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [done, setDone] = useState(false);
  const [gatesCount, setGatesCount] = useState(0);
  const [gatesLoaded, setGatesLoaded] = useState(0);
  const [sortBy, setSortBy] = useState("price");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<FlightFilterState>({ ...DEFAULT_FILTERS });
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef(false);

  const classInfo = CABIN_CLASSES.find((c) => c.value === cabinClass);
  const tripClassCode = classInfo?.short || "Y";

  const pollResults = useCallback(async (uuid: string) => {
    if (abortRef.current) return;
    try {
      const res = await fetch(`/api/flights/live-results?uuid=${uuid}`);
      if (!res.ok) throw new Error("Poll failed");
      const data = await res.json();
      if (data.results?.length > 0) setResults(data.results);
      if (data.gatesCount) setGatesCount(data.gatesCount);
      if (data.gatesLoaded) setGatesLoaded(data.gatesLoaded);
      if (data.done) {
        setDone(true);
        setSearching(false);
      } else if (!abortRef.current) {
        pollRef.current = setTimeout(() => pollResults(uuid), 2000);
      }
    } catch {
      if (!abortRef.current) {
        pollRef.current = setTimeout(() => pollResults(uuid), 3000);
      }
    }
  }, []);

  useEffect(() => {
    if (!origin || !destination || !departDate) return;
    abortRef.current = false;
    setResults([]);
    setSearchId("");
    setDone(false);
    setSearching(true);
    setLoading(true);
    setError("");
    setGatesCount(0);
    setGatesLoaded(0);
    setFilters({ ...DEFAULT_FILTERS });

    async function startSearch() {
      try {
        const res = await fetch("/api/flights/live-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin,
            destination,
            departDate,
            returnDate: returnDate || undefined,
            adults: 1,
            tripClass: tripClassCode,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Search failed");
        }
        const data = await res.json();
        setSearchId(data.search_id);
        setLoading(false);
        await new Promise((r) => setTimeout(r, 3000));
        pollResults(data.search_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start search");
        setLoading(false);
        setSearching(false);
      }
    }
    startSearch();
    return () => {
      abortRef.current = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [origin, destination, departDate, returnDate, tripClassCode, pollResults]);

  const grouped = useMemo(() => deduplicateProposals(results), [results]);

  const filtered = useMemo(() => {
    let list = [...grouped];

    if (filters.maxStops >= 0) {
      list = list.filter((r) => r.stops <= filters.maxStops);
    }
    if (filters.baggageOnly) {
      list = list.filter((r) => r.gates[0]?.baggage?.included);
    }
    if (filters.maxPrice > 0) {
      list = list.filter((r) => r.cheapestPrice <= filters.maxPrice);
    }
    if (filters.maxDuration > 0) {
      list = list.filter((r) => r.totalDuration <= filters.maxDuration);
    }
    if (filters.airlines.length > 0) {
      list = list.filter((r) => filters.airlines.includes(r.validatingCarrier));
    }

    switch (sortBy) {
      case "price":
        list.sort((a, b) => a.cheapestPrice - b.cheapestPrice);
        break;
      case "duration":
        list.sort((a, b) => a.totalDuration - b.totalDuration);
        break;
      case "stops":
        list.sort((a, b) => a.stops - b.stops);
        break;
    }

    return list;
  }, [grouped, filters, sortBy]);

  if (!origin || !destination || !departDate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="text-center py-16"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {premium ? (
            <Crown className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          ) : (
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          )}
        </motion.div>
        <h2 className={`text-2xl font-bold mb-2 ${premium ? "text-white" : ""}`}>
          {premium ? "Search Premium Flights" : "Search Flights"}
        </h2>
        <p className={premium ? "text-gray-400" : "text-muted-foreground"}>
          {premium
            ? "Find Business & First Class flights at the best prices."
            : "Enter your departure and destination to find live flight prices from dozens of providers."}
        </p>
      </motion.div>
    );
  }

  const selectTriggerClass = premium
    ? "w-[140px] bg-gray-800 border-amber-500/30 text-white"
    : "w-[140px]";

  const hasActiveFilters =
    filters.maxStops >= 0 ||
    filters.baggageOnly ||
    filters.maxPrice > 0 ||
    filters.maxDuration > 0 ||
    filters.airlines.length > 0;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mb-4 space-y-2"
      >
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className={`text-lg sm:text-xl font-bold truncate ${premium ? "text-white" : ""}`}>
              {originName || origin} to {destinationName || destination}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Sheet>
              <SheetTrigger
                className={`lg:hidden inline-flex items-center justify-center rounded-lg border px-2 sm:px-2.5 h-8 text-xs font-medium transition-colors ${
                  premium
                    ? `border-amber-500/30 text-amber-400 hover:bg-amber-500/10 ${hasActiveFilters ? "bg-amber-500/10" : ""}`
                    : `border-border hover:bg-accent ${hasActiveFilters ? "bg-accent" : ""}`
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className={`ml-1 sm:ml-1.5 w-2 h-2 rounded-full ${premium ? "bg-amber-400" : "bg-primary"}`} />
                )}
              </SheetTrigger>
              <SheetContent side="left" className={`w-[85vw] max-w-80 p-4 sm:p-6 ${premium ? "bg-gray-900 border-gray-800" : ""}`}>
                <FlightFilters
                  filters={filters}
                  onChange={setFilters}
                  results={grouped}
                  premium={premium}
                />
              </SheetContent>
            </Sheet>
            <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v); }}>
              <SelectTrigger className={`w-[110px] sm:w-[140px] h-8 text-xs sm:text-sm ${premium ? "bg-gray-800 border-amber-500/30 text-white" : ""}`}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="stops">Stops</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className={`text-xs sm:text-sm flex flex-wrap items-center gap-x-2 gap-y-0.5 ${premium ? "text-amber-400/80" : "text-muted-foreground"}`}>
          {premium && <Crown className="h-3.5 w-3.5" />}
          <span>{classInfo?.label || "Economy"} class</span>
          {filtered.length > 0 && <span>\u00B7 {filtered.length} flight{filtered.length !== 1 ? "s" : ""}</span>}
          {results.length > grouped.length && <span className="hidden sm:inline">\u00B7 {results.length} provider options</span>}
          {searching && (
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              <Radio className={`h-3 w-3 animate-pulse ${premium ? "text-amber-400" : "text-primary"}`} />
              <span className={`text-[10px] sm:text-sm ${premium ? "text-amber-400/60" : "text-muted-foreground"}`}>
                {gatesCount > 0 ? `${gatesLoaded}/${gatesCount}` : "Searching..."}
              </span>
            </span>
          )}
        </div>
      </motion.div>

      {/* Search progress */}
      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-3 sm:p-4 mb-4 flex items-center gap-2 sm:gap-3 ${
              premium ? "bg-amber-500/10 border border-amber-500/20" : "bg-primary/5 border border-primary/10"
            }`}
          >
            <Loader2 className={`h-4 w-4 sm:h-5 sm:w-5 animate-spin shrink-0 ${premium ? "text-amber-400" : "text-primary"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${premium ? "text-amber-300" : "text-foreground"}`}>
                Searching {gatesCount || "multiple"} providers...
              </p>
              {gatesCount > 0 && (
                <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      premium ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, (gatesLoaded / gatesCount) * 100)}%` }}
                  />
                </div>
              )}
            </div>
            <span className={`text-xs ${premium ? "text-amber-400/60" : "text-muted-foreground"}`}>
              {results.length} flights
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-1 text-muted-foreground">Please try again or search a different route.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <Skeleton className={`h-32 w-full rounded-xl ${premium ? "bg-gray-800" : ""}`} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Main layout: Filters sidebar + Results */}
      {!loading && results.length > 0 && (
        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className={`sticky top-20 rounded-xl border p-4 ${
              premium ? "bg-gray-900/50 border-amber-500/10" : "bg-card"
            }`}>
              <FlightFilters
                filters={filters}
                onChange={setFilters}
                results={grouped}
                premium={premium}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 space-y-3">
            {filtered.length > 0 ? (
              filtered.map((proposal, i) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.4, ease }}
                >
                  <FlightCard proposal={proposal} searchId={searchId} premium={premium} />
                </motion.div>
              ))
            ) : (
              <div className={`text-center py-12 border rounded-xl ${premium ? "bg-gray-900/50 border-amber-500/20" : "bg-card"}`}>
                <SlidersHorizontal className={`h-10 w-10 mx-auto mb-3 ${premium ? "text-amber-500/40" : "text-muted-foreground"}`} />
                <h3 className={`text-lg font-semibold mb-1 ${premium ? "text-white" : ""}`}>
                  No flights match your filters
                </h3>
                <p className={`text-sm mb-3 ${premium ? "text-gray-400" : "text-muted-foreground"}`}>
                  {results.length} flights available. Try adjusting your filters.
                </p>
                <button
                  onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                  className={`text-sm font-medium ${premium ? "text-amber-400 hover:text-amber-300" : "text-primary hover:underline"}`}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No results at all */}
      {!loading && !searching && results.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className={`text-center py-16 border rounded-xl ${premium ? "bg-gray-900/50 border-amber-500/20" : "bg-card"}`}
        >
          <Search className={`h-12 w-12 mx-auto mb-4 ${premium ? "text-amber-500/50" : "text-muted-foreground"}`} />
          <h3 className={`text-xl font-semibold mb-2 ${premium ? "text-white" : ""}`}>No flights found</h3>
          <p className={premium ? "text-gray-400" : "text-muted-foreground"}>Try different dates or a different route.</p>
        </motion.div>
      )}
    </div>
  );
}
