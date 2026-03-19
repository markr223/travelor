import { NextRequest, NextResponse } from "next/server";
import { getPopularDirections } from "@/lib/travelpayouts";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin");
  const currency = searchParams.get("currency") || "USD";

  if (!origin) {
    return NextResponse.json(
      { error: "origin is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getPopularDirections(origin, currency);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Directions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch popular directions" },
      { status: 500 }
    );
  }
}
