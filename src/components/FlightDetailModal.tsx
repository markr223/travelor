"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plane,
  Clock,
  ArrowRight,
  ExternalLink,
  Crown,
  Store,
  Luggage,
  Briefcase,
  XCircle,
  Calendar,
} from "lucide-react";
import type { LiveFlightProposal, LiveFlightSegment } from "@/lib/types";

interface FlightDetailModalProps {
  proposal: LiveFlightProposal;
  searchId: string;
  premium?: boolean;
  open: boolean;
  onClose: () => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function SegmentDetail({
  flights,
  label,
  premium,
  index,
}: {
  flights: LiveFlightSegment[];
  label: string;
  premium: boolean;
  index: number;
}) {
  const totalDuration = flights.reduce((s, f) => s + f.duration, 0);
  const stops = Math.max(0, flights.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.4 }}
      className={`rounded-xl border p-3 sm:p-4 ${premium ? "bg-gray-800/50 border-amber-500/15" : "bg-muted/30 border-border"}`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <h4 className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 ${premium ? "text-amber-400" : "text-foreground"}`}>
          <Plane className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${index === 1 ? "rotate-180" : ""}`} />
          {label}
        </h4>
        <div className={`text-[10px] sm:text-xs flex items-center gap-2 sm:gap-3 shrink-0 ${premium ? "text-gray-400" : "text-muted-foreground"}`}>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(totalDuration)}
          </span>
          <span className={stops === 0 ? "text-green-500" : "text-orange-500"}>
            {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className="space-y-0">
        {flights.map((flight, fi) => (
          <div key={fi}>
            {fi > 0 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3 + fi * 0.1 }}
                className={`ml-3 sm:ml-4 border-l-2 border-dashed py-1.5 sm:py-2 pl-3 sm:pl-4 my-1 text-[10px] sm:text-xs ${
                  premium ? "border-amber-500/20 text-amber-400/60" : "border-border text-muted-foreground"
                }`}
              >
                Connection &middot; {flights[fi - 1].destination}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + fi * 0.08 }}
              className={`flex items-stretch gap-2 sm:gap-3 ${premium ? "text-white" : ""}`}
            >
              <div className="flex flex-col items-center pt-1">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 shrink-0 ${premium ? "border-amber-400 bg-amber-400/20" : "border-primary bg-primary/20"}`} />
                <div className={`w-0.5 flex-1 ${premium ? "bg-amber-500/20" : "bg-border"}`} />
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 shrink-0 ${premium ? "border-amber-400 bg-amber-400/20" : "border-primary bg-primary/20"}`} />
              </div>

              <div className="flex-1 py-0.5 min-w-0">
                <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold">{flight.departureTime}</span>
                  <span className={`text-xs sm:text-sm ${premium ? "text-gray-300" : ""}`}>{flight.origin}</span>
                  <span className={`text-[10px] sm:text-xs ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline mr-0.5" />
                    {flight.departureDate}
                  </span>
                </div>

                <div className={`flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg mb-1.5 sm:mb-2 overflow-x-auto ${
                  premium ? "bg-gray-900/60 text-gray-400" : "bg-muted text-muted-foreground"
                }`}>
                  <img
                    src={`https://pics.avs.io/24/24/${flight.operatingCarrier}@2x.png`}
                    alt=""
                    className="w-4 h-4 rounded shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="font-medium whitespace-nowrap">{flight.flightNumber}</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {formatDuration(flight.duration)}
                  </span>
                  {flight.aircraft && <span className="whitespace-nowrap hidden sm:inline">{flight.aircraft}</span>}
                </div>

                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold">{flight.arrivalTime}</span>
                  <span className={`text-xs sm:text-sm ${premium ? "text-gray-300" : ""}`}>{flight.destination}</span>
                  <span className={`text-[10px] sm:text-xs ${premium ? "text-gray-500" : "text-muted-foreground"}`}>
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline mr-0.5" />
                    {flight.arrivalDate}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ModalContent({
  proposal,
  searchId,
  premium = false,
  onClose,
}: Omit<FlightDetailModalProps, "open">) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleBooking(gateUrl: number) {
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

  const segmentLabels = ["Outbound", "Return", "Segment 3"];

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-start justify-center sm:overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel - slides up on mobile, centered on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className={`relative w-full sm:max-w-2xl sm:mx-4 sm:my-8 md:my-16 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain ${
          premium
            ? "bg-gray-900 border border-amber-500/20"
            : "bg-background border"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className={`w-10 h-1 rounded-full ${premium ? "bg-gray-700" : "bg-muted-foreground/20"}`} />
        </div>

        {/* Sticky header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-3 sm:p-5 sm:pb-3 border-b sm:rounded-t-2xl ${
          premium ? "bg-gray-900 border-amber-500/10" : "bg-background"
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {proposal.airlineLogo && (
              <img
                src={proposal.airlineLogo}
                alt=""
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain p-1 shrink-0 ${premium ? "bg-gray-800" : "bg-muted"}`}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="min-w-0">
              <h3 className={`text-base sm:text-lg font-bold truncate ${premium ? "text-white" : ""}`}>
                {proposal.airlineName || proposal.validatingCarrier}
              </h3>
              <p className={`text-[10px] sm:text-xs truncate ${premium ? "text-gray-400" : "text-muted-foreground"}`}>
                {proposal.segments[0]?.[0]?.origin}
                <ArrowRight className="inline h-3 w-3 mx-0.5 sm:mx-1" />
                {proposal.segments[0]?.[proposal.segments[0].length - 1]?.destination}
                {proposal.segments[1] && (
                  <>
                    <ArrowRight className="inline h-3 w-3 mx-0.5 sm:mx-1" />
                    {proposal.segments[1]?.[proposal.segments[1].length - 1]?.destination}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
              premium ? "hover:bg-gray-800 text-gray-400" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {proposal.segments.map((flights, si) => (
            <SegmentDetail
              key={si}
              flights={flights}
              label={segmentLabels[si] || `Segment ${si + 1}`}
              premium={premium}
              index={si}
            />
          ))}

          {/* Price comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <h4 className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${premium ? "text-amber-400" : ""}`}>
              <Store className="h-4 w-4" />
              Price comparison ({proposal.gates.length} provider{proposal.gates.length !== 1 ? "s" : ""})
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              {proposal.gates.map((gate, gi) => (
                <motion.button
                  key={gate.gateId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + gi * 0.05 }}
                  onClick={() => handleBooking(gate.url)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all gap-2 ${
                    gi === 0
                      ? premium
                        ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                        : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      : premium
                        ? "bg-gray-800/50 border-gray-700/50 hover:border-amber-500/20 hover:bg-gray-800"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`text-left ${premium ? "text-white" : ""}`}>
                      <div className="text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="truncate">{gate.gateName}</span>
                        {gi === 0 && (
                          <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                            premium ? "bg-amber-500/20 text-amber-300" : "bg-primary/10 text-primary"
                          }`}>
                            Best
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 mt-0.5 ${premium ? "text-gray-400" : "text-muted-foreground"}`}>
                        {gate.baggage.included ? (
                          <span className="inline-flex items-center gap-0.5 text-green-500">
                            <Luggage className="h-3 w-3" />
                            <span className="hidden sm:inline">{gate.baggage.label}</span>
                            <span className="sm:hidden">Bag</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-orange-500">
                            <XCircle className="h-3 w-3" />
                            No bag
                          </span>
                        )}
                        {gate.handbag.pieces > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Briefcase className="h-3 w-3" />
                            <span className="hidden sm:inline">{gate.handbag.label}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className={`text-lg sm:text-xl font-bold ${
                      gi === 0
                        ? premium ? "text-amber-400" : "text-primary"
                        : premium ? "text-white" : ""
                    }`}>
                      ${Math.round(gate.price)}
                    </span>
                    <ExternalLink className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${premium ? "text-gray-500" : "text-muted-foreground"}`} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function FlightDetailModal({
  proposal,
  searchId,
  premium = false,
  open,
  onClose,
}: FlightDetailModalProps) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <ModalContent
          proposal={proposal}
          searchId={searchId}
          premium={premium}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
