import { NextRequest, NextResponse } from "next/server";
import { getFlightSearchResults, getSearchRates } from "@/lib/travelpayouts";
import type { LiveFlightProposal, LiveFlightGate, LiveFlightSegment, BaggageInfo, HandbagInfo } from "@/lib/types";

interface RawFlight {
  departure: string;
  arrival: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  duration: number;
  operating_carrier: string;
  number: number;
  aircraft?: string;
  delay?: number;
}

interface RawSegment {
  flight: RawFlight[];
}

interface RawTerm {
  price: number;
  currency: string;
  url: number;
  unified_price?: number;
  flights_baggage?: unknown[][];
  flights_handbags?: unknown[][];
}

interface RawProposal {
  terms: Record<string, RawTerm>;
  segment: RawSegment[];
  validating_carrier: string;
  segments_airports?: unknown;
}

interface RawGateInfo {
  label: string;
  average_rate?: number;
  is_airline?: boolean;
  payment_methods?: string[];
}

interface RawResultItem {
  proposals?: RawProposal[];
  gates_info?: Record<string, RawGateInfo>;
  airlines?: Record<string, { name: string; average_rate?: string }>;
  currency_rates?: Record<string, number>;
  search_id?: string;
  meta?: { gates?: Array<{ id: number; count: number }> };
}

function parseBaggage(raw: unknown[][] | undefined): BaggageInfo {
  if (!raw || raw.length === 0) return { included: false, pieces: 0, weight: null, label: "No checked bag" };
  const first = raw[0]?.[0];
  if (!first || first === false || first === "") {
    return { included: false, pieces: 0, weight: null, label: "No checked bag" };
  }
  const str = String(first);
  const match = str.match(/^(\d+)PC(\d+)?/);
  if (match) {
    const pieces = parseInt(match[1]) || 1;
    const weight = match[2] ? parseInt(match[2]) : null;
    const label = weight ? `${pieces}x ${weight}kg` : `${pieces} bag${pieces > 1 ? "s" : ""}`;
    return { included: true, pieces, weight, label };
  }
  return { included: true, pieces: 1, weight: null, label: "Bag included" };
}

function parseHandbag(raw: unknown[][] | undefined): HandbagInfo {
  if (!raw || raw.length === 0) return { pieces: 0, weight: null, dimensions: "", label: "No info" };
  const first = raw[0]?.[0];
  if (!first || first === "") return { pieces: 0, weight: null, dimensions: "", label: "No info" };
  const str = String(first);
  const pcMatch = str.match(/^(\d+)PC(\d+)?/);
  const dimMatch = str.match(/(\d+x\d+x\d+x\d+|\d+x\d+x\d+)/);
  const pieces = pcMatch ? parseInt(pcMatch[1]) : 1;
  const weight = pcMatch?.[2] ? parseInt(pcMatch[2]) : null;
  const dimensions = dimMatch ? dimMatch[1] : "";
  let label = "";
  if (weight) label = `${weight}kg`;
  else if (dimensions) label = dimensions.replace(/x/g, "x");
  else label = "Carry-on";
  return { pieces, weight, dimensions, label };
}

export async function GET(request: NextRequest) {
  const uuid = request.nextUrl.searchParams.get("uuid");

  if (!uuid) {
    return NextResponse.json({ error: "uuid is required" }, { status: 400 });
  }

  try {
    const raw = (await getFlightSearchResults(uuid)) as RawResultItem[];

    const allGates: Record<string, string> = {};
    const allAirlines: Record<string, string> = {};
    let currencyRates: Record<string, number> = {};
    let done = false;
    let gatesTotal = 0;
    let gatesLoaded = 0;
    const proposalMap = new Map<string, LiveFlightProposal>();

    for (const item of raw) {
      if (item.gates_info) {
        for (const [id, info] of Object.entries(item.gates_info)) {
          allGates[id] = info.label;
        }
      }

      if (item.airlines) {
        for (const [code, info] of Object.entries(item.airlines)) {
          allAirlines[code] = info.name;
        }
      }

      if (item.currency_rates) {
        currencyRates = item.currency_rates;
      }

      if (item.meta?.gates) {
        gatesTotal = item.meta.gates.length;
        gatesLoaded = item.meta.gates.filter((g) => g.count > 0).length;
      }

      if (
        item.search_id &&
        !item.proposals &&
        !item.gates_info &&
        !item.airlines
      ) {
        done = true;
      }

      if (!item.proposals) continue;

      // currency_rates may come from the initial search response (cached)
      if (Object.keys(currencyRates).length === 0) {
        const cached = getSearchRates(uuid);
        if (cached) currencyRates = cached;
      }

      // Rate is "1 USD = X RUB", so to convert RUB->USD we divide
      const usdRate = currencyRates["usd"] || 86;

      for (const proposal of item.proposals) {
        const segments: LiveFlightSegment[][] = [];
        let totalDuration = 0;
        let totalStops = 0;

        if (proposal.segment) {
          for (const seg of proposal.segment) {
            const flights: LiveFlightSegment[] = [];
            let segDuration = 0;
            for (const f of seg.flight) {
              segDuration += f.duration + (f.delay || 0);
              flights.push({
                origin: f.departure,
                destination: f.arrival,
                departureDate: f.departure_date,
                departureTime: f.departure_time,
                arrivalDate: f.arrival_date,
                arrivalTime: f.arrival_time,
                duration: f.duration,
                airline: f.operating_carrier,
                flightNumber: `${f.operating_carrier}${f.number}`,
                aircraft: f.aircraft || "",
                stops: 0,
                operatingCarrier: f.operating_carrier,
              });
            }
            totalDuration += segDuration;
            totalStops += Math.max(0, flights.length - 1);
            segments.push(flights);
          }
        }

        const gates: LiveFlightGate[] = [];
        let cheapest = Infinity;
        let cheapestGateName = "";

        for (const [gateId, term] of Object.entries(proposal.terms)) {
          const priceRub = term.unified_price || term.price;
          const priceUsd =
            usdRate > 0 ? Math.round((priceRub / usdRate) * 100) / 100 : priceRub;

          gates.push({
            gateId,
            gateName: allGates[gateId] || `Agency ${gateId}`,
            price: priceUsd,
            currency: "USD",
            url: term.url,
            baggage: parseBaggage(term.flights_baggage),
            handbag: parseHandbag(term.flights_handbags),
          });

          if (priceUsd < cheapest) {
            cheapest = priceUsd;
            cheapestGateName = allGates[gateId] || `Agency ${gateId}`;
          }
        }

        gates.sort((a, b) => a.price - b.price);

        const carrier = proposal.validating_carrier || "";
        const firstDep = segments[0]?.[0];
        const proposalId = `${carrier}-${firstDep?.departureTime || ""}-${firstDep?.origin || ""}-${cheapest}`;

        if (!proposalMap.has(proposalId) || cheapest < (proposalMap.get(proposalId)!.cheapestPrice)) {
          proposalMap.set(proposalId, {
            id: proposalId,
            validatingCarrier: carrier,
            airlineName: allAirlines[carrier] || carrier,
            airlineLogo: carrier
              ? `https://pics.avs.io/64/64/${carrier}@2x.png`
              : "",
            segments,
            gates: gates.slice(0, 5),
            totalDuration,
            stops: totalStops,
            cheapestPrice: cheapest === Infinity ? 0 : cheapest,
            cheapestGate: cheapestGateName,
          });
        }
      }
    }

    const results = Array.from(proposalMap.values())
      .sort((a, b) => a.cheapestPrice - b.cheapestPrice)
      .slice(0, 50);

    return NextResponse.json({
      done,
      searchId: uuid,
      results,
      currencyRates,
      gatesCount: gatesTotal,
      gatesLoaded,
    });
  } catch (err) {
    console.error("Live results error:", err);
    return NextResponse.json(
      { error: "Failed to fetch flight results" },
      { status: 500 }
    );
  }
}
