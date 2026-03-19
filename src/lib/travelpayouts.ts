import type {
  LookupResponse,
  FlightPricesResponse,
  CheapFlightsResponse,
  DirectionsResponse,
  TPAirline,
} from "./types";

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN!;
const MARKER = process.env.TRAVELPAYOUTS_MARKER!;

const TP_API = "https://api.travelpayouts.com";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchJSON<T>(url: string, cacheKey?: string): Promise<T> {
  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} for ${url}`);
  }

  const data = await res.json();
  if (cacheKey) setCache(cacheKey, data);
  return data as T;
}

// ─── City/Country data ───

export interface TPCity {
  name: string;
  code: string;
  country_code: string;
  name_translations: { en?: string };
  coordinates: { lat: number; lon: number };
  time_zone: string;
  has_flightable_airport: boolean;
}

export interface TPCountry {
  name: string;
  code: string;
  name_translations: { en?: string };
  currency: string;
}

let citiesCache: TPCity[] | null = null;
let countriesCache: TPCountry[] | null = null;
let airlinesCache: TPAirline[] | null = null;

export async function getCities(): Promise<TPCity[]> {
  if (citiesCache) return citiesCache;
  citiesCache = await fetchJSON<TPCity[]>(
    `${TP_API}/data/en/cities.json?token=${TOKEN}`,
    "tp_cities"
  );
  return citiesCache;
}

export async function getCountries(): Promise<TPCountry[]> {
  if (countriesCache) return countriesCache;
  countriesCache = await fetchJSON<TPCountry[]>(
    `${TP_API}/data/en/countries.json?token=${TOKEN}`,
    "tp_countries"
  );
  return countriesCache;
}

export async function getAirlines(): Promise<TPAirline[]> {
  if (airlinesCache) return airlinesCache;
  airlinesCache = await fetchJSON<TPAirline[]>(
    `${TP_API}/data/en/airlines.json?token=${TOKEN}`,
    "tp_airlines"
  );
  return airlinesCache;
}

export async function lookupCities(
  query: string,
  limit = 10
): Promise<LookupResponse> {
  const cities = await getCities();
  const countries = await getCountries();

  const q = query.toLowerCase().trim();
  const matched = cities
    .filter((c) => {
      const name = (c.name || "").toLowerCase();
      const en = (c.name_translations?.en || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      return name.startsWith(q) || en.startsWith(q) || code === q;
    })
    .slice(0, limit);

  const countryMap = new Map(countries.map((c) => [c.code, c]));

  return {
    results: {
      locations: matched.map((c) => {
        const country = countryMap.get(c.country_code);
        return {
          cityName: c.name_translations?.en || c.name,
          fullName: `${c.name_translations?.en || c.name}, ${country?.name || c.country_code}`,
          countryCode: c.country_code,
          countryName: country?.name || c.country_code,
          iata: c.code ? [c.code] : [],
          id: c.code,
          hotelsCount: "",
          location: {
            lat: String(c.coordinates?.lat || 0),
            lon: String(c.coordinates?.lon || 0),
          },
          _score: 1,
        };
      }),
      hotels: [],
    },
    status: "ok",
  };
}

// ─── Flight APIs ───

export async function getLatestPrices(
  origin: string,
  destination: string,
  tripClass = 0,
  currency = "USD",
  limit = 30,
  oneWay = false
): Promise<FlightPricesResponse> {
  const params = new URLSearchParams({
    origin,
    destination,
    currency,
    token: TOKEN,
    limit: String(limit),
    show_to_affiliates: "true",
    sorting: "price",
    trip_class: String(tripClass),
    period_type: "year",
  });
  if (oneWay) params.set("one_way", "true");
  const key = `flights_latest:${params}`;
  return fetchJSON<FlightPricesResponse>(
    `${TP_API}/v2/prices/latest?${params}`,
    key
  );
}

export async function getCheapFlights(
  origin: string,
  destination: string,
  departDate?: string,
  returnDate?: string,
  tripClass = 0,
  currency = "USD"
): Promise<CheapFlightsResponse> {
  const params = new URLSearchParams({
    origin,
    destination,
    currency,
    token: TOKEN,
    trip_class: String(tripClass),
  });
  if (departDate) params.set("depart_date", departDate);
  if (returnDate) params.set("return_date", returnDate);
  const key = `flights_cheap:${params}`;
  return fetchJSON<CheapFlightsResponse>(
    `${TP_API}/v1/prices/cheap?${params}`,
    key
  );
}

export async function getPopularDirections(
  origin: string,
  currency = "USD"
): Promise<DirectionsResponse> {
  const params = new URLSearchParams({
    origin,
    currency,
    token: TOKEN,
  });
  const key = `flights_dirs:${origin}`;
  return fetchJSON<DirectionsResponse>(
    `${TP_API}/v1/city-directions?${params}`,
    key
  );
}

export async function getCalendarPrices(
  origin: string,
  destination: string,
  departDate?: string,
  tripClass = 0,
  currency = "USD"
): Promise<FlightPricesResponse> {
  const params = new URLSearchParams({
    origin,
    destination,
    currency,
    token: TOKEN,
    trip_class: String(tripClass),
  });
  if (departDate) params.set("depart_date", departDate);
  const key = `flights_cal:${params}`;
  return fetchJSON<FlightPricesResponse>(
    `${TP_API}/v1/prices/calendar?${params}`,
    key
  );
}

// ─── Live Flight Search API ───

import { createHash } from "crypto";

function flattenForSignature(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      const parts: string[] = [];
      for (const item of val) {
        if (typeof item === "object" && item !== null) {
          const inner = flattenForSignature(item as Record<string, unknown>);
          const sorted = Object.keys(inner).sort().map((k) => inner[k]);
          parts.push(sorted.join(":"));
        } else {
          parts.push(String(item));
        }
      }
      result[key] = parts.join(":");
    } else if (typeof val === "object" && val !== null) {
      const inner = flattenForSignature(val as Record<string, unknown>);
      const sorted = Object.keys(inner).sort().map((k) => inner[k]);
      result[key] = sorted.join(":");
    } else {
      result[key] = String(val);
    }
  }
  return result;
}

function generateSignature(query: Record<string, unknown>): string {
  const flat = flattenForSignature(query);
  const sorted = Object.keys(flat).sort().map((k) => flat[k]);
  const input = [TOKEN, ...sorted].join(":");
  return createHash("md5").update(input).digest("hex");
}

const searchRatesCache = new Map<string, Record<string, number>>();

export function getSearchRates(searchId: string): Record<string, number> | null {
  return searchRatesCache.get(searchId) || null;
}

export async function startFlightSearch(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  tripClass?: string;
  userIp?: string;
}): Promise<{ search_id: string; currency_rates?: Record<string, number> }> {
  const segments: Array<{ origin: string; destination: string; date: string }> = [
    { origin: params.origin, destination: params.destination, date: params.departDate },
  ];
  if (params.returnDate) {
    segments.push({
      origin: params.destination,
      destination: params.origin,
      date: params.returnDate,
    });
  }

  const query: Record<string, unknown> = {
    marker: MARKER,
    host: "localhost",
    user_ip: params.userIp || "127.0.0.1",
    locale: "en",
    trip_class: params.tripClass || "Y",
    passengers: {
      adults: params.adults || 1,
      children: params.children || 0,
      infants: params.infants || 0,
    },
    segments,
  };

  query.signature = generateSignature(query);

  const res = await fetch(`${TP_API}/v1/flight_search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Token": TOKEN,
      "Accept-Encoding": "gzip,deflate,sdch",
    },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flight search failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.search_id && data.currency_rates) {
    searchRatesCache.set(data.search_id, data.currency_rates);
    setTimeout(() => searchRatesCache.delete(data.search_id), 20 * 60 * 1000);
  }

  return data;
}

export async function getFlightSearchResults(uuid: string): Promise<unknown[]> {
  const res = await fetch(
    `${TP_API}/v1/flight_search_results?uuid=${uuid}`,
    {
      headers: {
        "Accept-Encoding": "gzip,deflate,sdch",
        "X-Access-Token": TOKEN,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Flight results failed: ${res.status}`);
  }

  return res.json();
}

export function getClickUrl(searchId: string, termsUrl: number): string {
  return `${TP_API}/v1/flight_searches/${searchId}/clicks/${termsUrl}.json`;
}

// ─── Affiliate links ───

export function getFlightAffiliateUrl(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string,
  tripClass = 0
): string {
  const classMap: Record<number, number> = { 0: 1, 1: 2, 2: 3 };
  const aviasalesClass = classMap[tripClass] || 1;
  let path = `${origin}${departDate.replace(/-/g, "").slice(2)}${destination}`;
  if (returnDate) {
    path += returnDate.replace(/-/g, "").slice(2);
  }
  return `https://www.aviasales.com/search/${path}${aviasalesClass}?marker=${MARKER}`;
}

export function getAirlineLogoUrl(code: string, size = 64): string {
  return `https://pics.avs.io/${size}/${size}/${code}@2x.png`;
}

export function getCityPhotoUrl(
  iataCode: string,
  width = 960,
  height = 720
): string {
  return `https://photo.hotellook.com/static/cities/${width}x${height}/${iataCode}.jpg`;
}

export const POPULAR_DESTINATIONS = [
  { name: "Paris", country: "France", code: "PAR" },
  { name: "London", country: "United Kingdom", code: "LON" },
  { name: "Dubai", country: "UAE", code: "DXB" },
  { name: "Bangkok", country: "Thailand", code: "BKK" },
  { name: "Rome", country: "Italy", code: "ROM" },
  { name: "Barcelona", country: "Spain", code: "BCN" },
  { name: "Istanbul", country: "Turkey", code: "IST" },
  { name: "New York", country: "USA", code: "NYC" },
  { name: "Tokyo", country: "Japan", code: "TYO" },
  { name: "Amsterdam", country: "Netherlands", code: "AMS" },
  { name: "Singapore", country: "Singapore", code: "SIN" },
  { name: "Los Angeles", country: "USA", code: "LAX" },
];
