import { NextRequest, NextResponse } from "next/server";
import { lookupCities } from "@/lib/travelpayouts";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query) {
    return NextResponse.json(
      { error: "query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const data = await lookupCities(query, limit);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Lookup error:", err);
    return NextResponse.json(
      { error: "Failed to fetch city lookup data" },
      { status: 500 }
    );
  }
}
