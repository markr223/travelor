import { NextRequest, NextResponse } from "next/server";
import { getClickUrl } from "@/lib/travelpayouts";

export async function GET(request: NextRequest) {
  const searchId = request.nextUrl.searchParams.get("searchId");
  const url = request.nextUrl.searchParams.get("url");

  if (!searchId || !url) {
    return NextResponse.json(
      { error: "searchId and url are required" },
      { status: 400 }
    );
  }

  try {
    const clickUrl = getClickUrl(searchId, parseInt(url));
    const res = await fetch(clickUrl, {
      redirect: "manual",
      headers: { "X-Access-Token": process.env.TRAVELPAYOUTS_TOKEN! },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        return NextResponse.json({ url: location });
      }
    }

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return NextResponse.json({ url: data.url });
      }
    }

    return NextResponse.json({ url: clickUrl });
  } catch (err) {
    console.error("Click URL error:", err);
    return NextResponse.json(
      { url: getClickUrl(searchId, parseInt(url)) },
    );
  }
}
