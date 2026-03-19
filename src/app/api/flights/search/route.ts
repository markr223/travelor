import { NextRequest, NextResponse } from "next/server";
import { getLatestPrices } from "@/lib/travelpayouts";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const tripClass = parseInt(searchParams.get("tripClass") || "0");
  const currency = searchParams.get("currency") || "USD";
  const limit = parseInt(searchParams.get("limit") || "20");
  const oneWay = searchParams.get("oneWay") === "true";

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "origin and destination are required" },
      { status: 400 }
    );
  }

  try {
    const data = await getLatestPrices(
      origin,
      destination,
      tripClass,
      currency,
      limit,
      oneWay
    );
    return NextResponse.json(data);
  } catch (err) {
    console.error("Flight search error:", err);
    return NextResponse.json(
      { error: "Failed to fetch flight prices" },
      { status: 500 }
    );
  }
}
