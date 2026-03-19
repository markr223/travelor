import { NextRequest, NextResponse } from "next/server";
import { getCalendarPrices } from "@/lib/travelpayouts";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departDate = searchParams.get("departDate") || undefined;
  const tripClass = parseInt(searchParams.get("tripClass") || "0");
  const currency = searchParams.get("currency") || "USD";

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "origin and destination are required" },
      { status: 400 }
    );
  }

  try {
    const data = await getCalendarPrices(
      origin,
      destination,
      departDate,
      tripClass,
      currency
    );
    return NextResponse.json(data);
  } catch (err) {
    console.error("Calendar prices error:", err);
    return NextResponse.json(
      { error: "Failed to fetch calendar prices" },
      { status: 500 }
    );
  }
}
