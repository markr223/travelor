"use client";

import { useState } from "react";
import {
  Plane,
  Clock,
  ArrowRight,
  ExternalLink,
  Crown,
  Store,
  Luggage,
  Briefcase,
  XCircle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FlightDetailModal } from "@/components/FlightDetailModal";
import type { LiveFlightProposal, LiveFlightSegment } from "@/lib/types";

interface FlightCardProps {
  proposal: LiveFlightProposal;
  searchId: string;
  premium?: boolean;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatStops(stops: number): string {
  if (stops === 0) return "Direct";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

function SegmentRow({
  flights,
  premium,
  compact,
}: {
  flights: LiveFlightSegment[];
  premium: boolean;
  compact?: boolean;
}) {
  if (!flights || flights.length === 0) return null;
  const first = flights[0];
  const last = flights[flights.length - 1];
  const stops = Math.max(0, flights.length - 1);
  const duration = flights.reduce((s, f) => s + f.duration, 0);
  const textSize = compact ? "text-sm" : "text-lg";

  return (
    <div className="flex items-center gap-3">
      {/* Departure */}
      <div className="text-left min-w-[70px]">
        <div className={`${textSize} font-bold ${premium ? "text-white" : ""}`}>{first.departureTime}</div>
        <div className={`text-[11px] leading-tight ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
          {first.origin}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col items-center gap-0.5 px-1">
        <div className={`text-[11px] flex items-center gap-1 ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
          <Clock className="h-3 w-3" />
          {formatDuration(duration)}
        </div>
        <div className="w-full relative flex items-center h-4">
          <div className={`absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 ${premium ? "bg-amber-500/25" : "bg-border"}`} />
          {stops > 0 &&
            flights.slice(0, -1).map((f, i) => (
              <div
                key={i}
                className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 ${
                  premium ? "border-amber-400 bg-gray-900" : "border-primary bg-background"
                }`}
                style={{ left: `${((i + 1) / flights.length) * 100}%`, transform: "translate(-50%, -50%)" }}
              />
            ))}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Plane className={`h-3.5 w-3.5 ${premium ? "text-amber-400" : "text-primary"}`} />
          </div>
        </div>
        <div className={`text-[11px] font-medium ${
          stops === 0
            ? premium ? "text-emerald-400" : "text-green-600"
            : premium ? "text-amber-400" : "text-orange-500"
        }`}>
          {formatStops(stops)}
        </div>
      </div>

      {/* Arrival */}
      <div className="text-right min-w-[70px]">
        <div className={`${textSize} font-bold ${premium ? "text-white" : ""}`}>{last.arrivalTime}</div>
        <div className={`text-[11px] leading-tight ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
          {last.destination}
        </div>
      </div>
    </div>
  );
}

export function FlightCard({ proposal, searchId, premium = false }: FlightCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showMoreGates, setShowMoreGates] = useState(false);

  const outbound = proposal.segments[0];
  const inbound = proposal.segments[1];
  const isOneWay = !inbound || inbound.length === 0;
  const cheapest = proposal.gates[0];
  const firstFlight = outbound?.[0];

  async function handleBooking(e: React.MouseEvent, gateUrl: number) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/flights/click?searchId=${searchId}&url=${gateUrl}`);
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } catch {
      window.open(
        `https://api.travelpayouts.com/v1/flight_searches/${searchId}/clicks/${gateUrl}.json`,
        "_blank"
      );
    }
  }

  return (
    <>
      <Card
        className={`transition-all duration-200 cursor-pointer overflow-hidden ${
          premium
            ? "bg-gray-900/80 border-l-4 border-l-amber-500 border-t-amber-500/10 border-r-amber-500/10 border-b-amber-500/10 hover:shadow-xl hover:shadow-amber-500/10"
            : "hover:shadow-lg hover:border-primary/30"
        }`}
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-0">
          <div className={`flex ${isOneWay ? "flex-row" : "flex-col sm:flex-row"}`}>
            {/* Left: Flight info */}
            <div className="flex-1 p-4 md:p-5">
              {/* Airline row */}
              <div className="flex items-center gap-2.5 mb-3">
                {proposal.airlineLogo && (
                  <img
                    src={proposal.airlineLogo}
                    alt=""
                    className={`w-8 h-8 rounded-lg object-contain p-0.5 ${premium ? "bg-gray-800" : "bg-muted"}`}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold truncate ${premium ? "text-white" : ""}`}>
                    {proposal.airlineName || proposal.validatingCarrier}
                  </div>
                  <div className={`text-[11px] ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
                    {firstFlight?.flightNumber}
                    {firstFlight && ` \u00B7 ${firstFlight.departureDate}`}
                  </div>
                </div>
                {premium && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10">
                    <Crown className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] font-semibold text-amber-400">Premium</span>
                  </div>
                )}
              </div>

              {/* Outbound */}
              <SegmentRow flights={outbound} premium={premium} />

              {/* Return */}
              {!isOneWay && inbound && (
                <div className={`mt-2.5 pt-2.5 border-t border-dashed ${premium ? "border-amber-500/10" : "border-border/40"}`}>
                  <SegmentRow flights={inbound} premium={premium} compact />
                </div>
              )}
            </div>

            {/* Right: Price panel */}
            <div
              className={`flex flex-col items-end justify-between p-4 md:p-5 sm:w-56 shrink-0 ${
                premium
                  ? "sm:border-l sm:border-amber-500/10 bg-gray-950/40"
                  : "sm:border-l sm:border-border/50 bg-muted/20"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {cheapest && (
                <>
                  {/* Price */}
                  <div className="text-right w-full">
                    <div className={`text-3xl font-extrabold tracking-tight ${premium ? "text-amber-400" : "text-primary"}`}>
                      ${Math.round(cheapest.price)}
                    </div>
                    <div className={`text-xs flex items-center justify-end gap-1 mt-0.5 ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
                      <Store className="h-3 w-3" />
                      {cheapest.gateName}
                    </div>

                    {/* Baggage */}
                    <div className={`flex items-center justify-end gap-2 mt-1 text-[11px] ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
                      {cheapest.baggage.included ? (
                        <span className="inline-flex items-center gap-0.5 text-green-500">
                          <Luggage className="h-3 w-3" />
                          {cheapest.baggage.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-orange-500">
                          <XCircle className="h-3 w-3" />
                          No bag
                        </span>
                      )}
                      {cheapest.handbag.pieces > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <Briefcase className="h-3 w-3" />
                          {cheapest.handbag.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Book button */}
                  <button
                    onClick={(e) => handleBooking(e, cheapest.url)}
                    className={`mt-3 w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 transition-all ${
                      premium
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {premium && <Crown className="mr-1.5 h-4 w-4" />}
                    Book
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </button>

                  {/* More providers toggle */}
                  {proposal.gates.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMoreGates(!showMoreGates);
                      }}
                      className={`mt-2 w-full flex items-center justify-center gap-1 text-[11px] font-medium py-1 rounded-md transition-colors ${
                        premium
                          ? "text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {showMoreGates ? "Hide" : `+${proposal.gates.length - 1} more`}
                      <ChevronDown className={`h-3 w-3 transition-transform ${showMoreGates ? "rotate-180" : ""}`} />
                    </button>
                  )}

                  {/* Expanded gates */}
                  {showMoreGates && (
                    <div className="w-full mt-1 space-y-0.5">
                      {proposal.gates.slice(1).map((gate) => (
                        <button
                          key={gate.gateId}
                          onClick={(e) => handleBooking(e, gate.url)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                            premium ? "hover:bg-amber-500/10 text-gray-400" : "hover:bg-accent text-muted-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            {gate.gateName}
                            <span>
                              {gate.baggage.included ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-orange-400" />
                              )}
                            </span>
                          </span>
                          <span className="font-semibold shrink-0 ml-2">${Math.round(gate.price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Details hint bar */}
          <div className={`text-center py-1.5 text-[11px] font-medium border-t transition-colors ${
            premium
              ? "border-amber-500/5 text-gray-600 hover:text-amber-400/60 bg-gray-950/30"
              : "border-border/30 text-muted-foreground/50 hover:text-muted-foreground bg-muted/10"
          }`}>
            View flight details
            {proposal.gates.length > 1 &&
              ` \u00B7 Compare ${proposal.gates.length} providers`}
          </div>
        </CardContent>
      </Card>

      <FlightDetailModal
        proposal={proposal}
        searchId={searchId}
        premium={premium}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
