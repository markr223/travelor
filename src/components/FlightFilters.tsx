"use client";

import {
  Luggage,
  ArrowDownUp,
  Clock,
  DollarSign,
  Plane,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { LiveFlightProposal } from "@/lib/types";

export interface FlightFilterState {
  maxStops: number;
  baggageOnly: boolean;
  maxPrice: number;
  maxDuration: number;
  airlines: string[];
}

interface FlightFiltersProps {
  filters: FlightFilterState;
  onChange: (f: FlightFilterState) => void;
  results: LiveFlightProposal[];
  premium?: boolean;
}

export const DEFAULT_FILTERS: FlightFilterState = {
  maxStops: -1,
  baggageOnly: false,
  maxPrice: 0,
  maxDuration: 0,
  airlines: [],
};

export function FlightFilters({
  filters,
  onChange,
  results,
  premium = false,
}: FlightFiltersProps) {
  const maxPriceInData = Math.max(
    ...results.map((r) => r.cheapestPrice).filter((p) => p > 0),
    500
  );
  const maxDurationInData = Math.max(
    ...results.map((r) => r.totalDuration).filter((d) => d > 0),
    600
  );

  const allAirlines = [
    ...new Map(
      results
        .filter((r) => r.validatingCarrier)
        .map((r) => [r.validatingCarrier, r.airlineName || r.validatingCarrier])
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1]));

  const stopCounts = results.reduce(
    (acc, r) => {
      acc[r.stops] = (acc[r.stops] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  const baggageCount = results.filter(
    (r) => r.gates[0]?.baggage?.included
  ).length;

  const effectiveMaxPrice = filters.maxPrice || maxPriceInData;
  const effectiveMaxDuration = filters.maxDuration || maxDurationInData;

  const hasActiveFilters =
    filters.maxStops >= 0 ||
    filters.baggageOnly ||
    (filters.maxPrice > 0 && filters.maxPrice < maxPriceInData) ||
    (filters.maxDuration > 0 && filters.maxDuration < maxDurationInData) ||
    filters.airlines.length > 0;

  const label = premium ? "text-amber-400/80" : "text-muted-foreground";
  const text = premium ? "text-white" : "";
  const btnActive = premium
    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
    : "bg-primary/10 border-primary/30 text-primary";
  const btnInactive = premium
    ? "border-gray-700 text-gray-400 hover:border-amber-500/30 hover:text-amber-400"
    : "border-border text-muted-foreground hover:border-primary/30";
  const sliderAccent = premium
    ? "accent-amber-500"
    : "accent-primary";

  function formatDuration(m: number): string {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h${min > 0 ? ` ${min}m` : ""}` : `${min}m`;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${text}`}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className={`text-xs flex items-center gap-1 ${premium ? "text-amber-400 hover:text-amber-300" : "text-primary hover:underline"}`}
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Stops */}
      <div>
        <h4 className={`text-xs font-medium mb-2 flex items-center gap-1 ${label}`}>
          <ArrowDownUp className="h-3 w-3" />
          Stops
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: -1, label: "Any" },
            { value: 0, label: "Direct", count: stopCounts[0] },
            { value: 1, label: "1 stop", count: stopCounts[1] },
            { value: 2, label: "2+", count: (stopCounts[2] || 0) + (stopCounts[3] || 0) },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, maxStops: opt.value })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                filters.maxStops === opt.value ? btnActive : btnInactive
              }`}
            >
              {opt.label}
              {opt.count !== undefined && opt.count > 0 && (
                <span className="ml-1 opacity-60">({opt.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator className={premium ? "bg-gray-700" : ""} />

      {/* Baggage */}
      <div>
        <h4 className={`text-xs font-medium mb-2 flex items-center gap-1 ${label}`}>
          <Luggage className="h-3 w-3" />
          Baggage
        </h4>
        <button
          onClick={() =>
            onChange({ ...filters, baggageOnly: !filters.baggageOnly })
          }
          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            filters.baggageOnly ? btnActive : btnInactive
          }`}
        >
          Checked bag included
          {baggageCount > 0 && (
            <span className="ml-1 opacity-60">({baggageCount})</span>
          )}
        </button>
      </div>

      <Separator className={premium ? "bg-gray-700" : ""} />

      {/* Price range */}
      <div>
        <h4 className={`text-xs font-medium mb-2 flex items-center gap-1 ${label}`}>
          <DollarSign className="h-3 w-3" />
          Max price
        </h4>
        <input
          type="range"
          min={0}
          max={Math.ceil(maxPriceInData)}
          step={10}
          value={effectiveMaxPrice}
          onChange={(e) => {
            const val = Number(e.target.value);
            onChange({
              ...filters,
              maxPrice: val >= maxPriceInData ? 0 : val,
            });
          }}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted ${sliderAccent}`}
        />
        <div className={`flex justify-between text-xs mt-1 ${label}`}>
          <span>$0</span>
          <span className={text}>
            {filters.maxPrice > 0 && filters.maxPrice < maxPriceInData
              ? `Up to $${filters.maxPrice}`
              : "Any"}
          </span>
          <span>${Math.ceil(maxPriceInData)}</span>
        </div>
      </div>

      <Separator className={premium ? "bg-gray-700" : ""} />

      {/* Duration */}
      <div>
        <h4 className={`text-xs font-medium mb-2 flex items-center gap-1 ${label}`}>
          <Clock className="h-3 w-3" />
          Max duration
        </h4>
        <input
          type="range"
          min={0}
          max={maxDurationInData}
          step={30}
          value={effectiveMaxDuration}
          onChange={(e) => {
            const val = Number(e.target.value);
            onChange({
              ...filters,
              maxDuration: val >= maxDurationInData ? 0 : val,
            });
          }}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted ${sliderAccent}`}
        />
        <div className={`flex justify-between text-xs mt-1 ${label}`}>
          <span>Any</span>
          <span className={text}>
            {filters.maxDuration > 0 && filters.maxDuration < maxDurationInData
              ? `Up to ${formatDuration(filters.maxDuration)}`
              : "Any"}
          </span>
          <span>{formatDuration(maxDurationInData)}</span>
        </div>
      </div>

      {/* Airlines */}
      {allAirlines.length > 1 && (
        <>
          <Separator className={premium ? "bg-gray-700" : ""} />
          <div>
            <h4 className={`text-xs font-medium mb-2 flex items-center gap-1 ${label}`}>
              <Plane className="h-3 w-3" />
              Airlines
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {allAirlines.map(([code, name]) => (
                <label
                  key={code}
                  className={`flex items-center gap-2 cursor-pointer text-xs ${premium ? "text-gray-300" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.airlines.length === 0 ||
                      filters.airlines.includes(code)
                    }
                    onChange={(e) => {
                      let next: string[];
                      if (e.target.checked) {
                        if (filters.airlines.length === 0) {
                          next = [];
                        } else {
                          next = [...filters.airlines, code];
                          if (next.length === allAirlines.length) next = [];
                        }
                      } else {
                        if (filters.airlines.length === 0) {
                          next = allAirlines
                            .map(([c]) => c)
                            .filter((c) => c !== code);
                        } else {
                          next = filters.airlines.filter((c) => c !== code);
                        }
                      }
                      onChange({ ...filters, airlines: next });
                    }}
                    className={`rounded ${premium ? "accent-amber-500" : ""}`}
                  />
                  <img
                    src={`https://pics.avs.io/24/24/${code}@2x.png`}
                    alt=""
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="truncate">{name}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
