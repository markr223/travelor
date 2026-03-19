export interface LocationResult {
  cityName: string;
  fullName: string;
  countryCode: string;
  countryName: string;
  iata: string[];
  id: string;
  hotelsCount: string;
  location: { lat: string; lon: string };
  _score: number;
}

export interface HotelLookupResult {
  label: string;
  locationName: string;
  locationId: string;
  id: string;
  fullName: string;
  location: { lat: string; lon: string };
}

export interface LookupResponse {
  results: {
    locations: LocationResult[];
    hotels: HotelLookupResult[];
  };
  status: string;
}

export interface FlightPrice {
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  number_of_changes: number;
  value: number;
  gate: string;
  found_at: string;
  trip_class: number;
  distance: number;
  duration: number;
  duration_to?: number;
  duration_back?: number;
  show_to_affiliates: boolean;
  actual: boolean;
  airline?: string;
  flight_number?: number;
}

export interface FlightPricesResponse {
  success: boolean;
  currency: string;
  data: FlightPrice[];
}

export interface CheapFlightData {
  [destination: string]: {
    [index: string]: {
      price: number;
      airline: string;
      flight_number: number;
      departure_at: string;
      return_at: string;
      expires_at: string;
      duration?: number;
      duration_to?: number;
      duration_back?: number;
    };
  };
}

export interface CheapFlightsResponse {
  success: boolean;
  currency: string;
  data: CheapFlightData;
}

export interface DirectionFlight {
  origin: string;
  destination: string;
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
  transfers: number;
}

export interface DirectionsResponse {
  success: boolean;
  currency: string;
  data: Record<string, DirectionFlight>;
}

export interface TPAirline {
  name: string;
  code: string;
  is_lowcost: boolean;
}

export const CABIN_CLASSES = [
  { value: 0, label: "Economy", short: "Y" },
  { value: 1, label: "Business", short: "C" },
  { value: 2, label: "First Class", short: "F" },
] as const;

export type CabinClassValue = 0 | 1 | 2;

// ─── Live Flight Search types ───

export interface LiveFlightSegment {
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: number;
  airline: string;
  flightNumber: string;
  aircraft: string;
  stops: number;
  operatingCarrier: string;
}

export interface BaggageInfo {
  included: boolean;
  pieces: number;
  weight: number | null;
  label: string;
}

export interface HandbagInfo {
  pieces: number;
  weight: number | null;
  dimensions: string;
  label: string;
}

export interface LiveFlightGate {
  gateId: string;
  gateName: string;
  price: number;
  currency: string;
  url: number;
  baggage: BaggageInfo;
  handbag: HandbagInfo;
}

export interface LiveFlightProposal {
  id: string;
  validatingCarrier: string;
  airlineName: string;
  airlineLogo: string;
  segments: LiveFlightSegment[][];
  gates: LiveFlightGate[];
  totalDuration: number;
  stops: number;
  cheapestPrice: number;
  cheapestGate: string;
}

export interface LiveSearchResponse {
  done: boolean;
  searchId: string;
  results: LiveFlightProposal[];
  currencyRates: Record<string, number>;
  gatesCount: number;
  gatesLoaded: number;
}
