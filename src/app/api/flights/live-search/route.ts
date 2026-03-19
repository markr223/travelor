import { NextRequest, NextResponse } from "next/server";
import { startFlightSearch } from "@/lib/travelpayouts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      departDate,
      returnDate,
      adults,
      children,
      infants,
      tripClass,
    } = body;

    if (!origin || !destination || !departDate) {
      return NextResponse.json(
        { error: "origin, destination, and departDate are required" },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const data = await startFlightSearch({
      origin,
      destination,
      departDate,
      returnDate,
      adults: adults || 1,
      children: children || 0,
      infants: infants || 0,
      tripClass: tripClass || "Y",
      userIp: ip,
    });

    return NextResponse.json({ search_id: data.search_id });
  } catch (err) {
    console.error("Live search start error:", err);
    return NextResponse.json(
      { error: "Failed to start flight search" },
      { status: 500 }
    );
  }
}
