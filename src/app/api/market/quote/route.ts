import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get("symbols");
  if (!symbols) {
    return NextResponse.json({ error: "symbols param required" }, { status: 400 });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,regularMarketDayHigh,regularMarketDayLow,shortName`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Yahoo API returned ${res.status}`);
    }

    const data = await res.json();
    const quotes = data?.quoteResponse?.result || [];

    const result = quotes.map((q: Record<string, unknown>) => ({
      symbol: q.symbol,
      shortName: q.shortName,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      avgVolume: q.averageDailyVolume3Month,
      dayHigh: q.regularMarketDayHigh,
      dayLow: q.regularMarketDayLow,
    }));

    return NextResponse.json({ quotes: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quotes", quotes: [] },
      { status: 500 }
    );
  }
}
