import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Mover {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  highActivity: boolean;
}

async function fetchYahooMovers(type: "gainers" | "losers"): Promise<Mover[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&lang=en-US&region=US&scrIds=${type === "gainers" ? "day_gainers" : "day_losers"}&count=15`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    // Fallback: try the v6 quote endpoint with curated list
    return [];
  }

  try {
    const data = await res.json();
    const quotes = data?.finance?.result?.[0]?.quotes || [];

    return quotes.map((q: Record<string, number | string>) => {
      const vol = Number(q.regularMarketVolume) || 0;
      const avgVol = Number(q.averageDailyVolume3Month) || 1;
      return {
        ticker: String(q.symbol),
        price: Number(q.regularMarketPrice) || 0,
        change: Number(q.regularMarketChange) || 0,
        changePercent: Number(q.regularMarketChangePercent) || 0,
        volume: vol,
        avgVolume: avgVol,
        highActivity: vol > avgVol * 2,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [gainers, losers] = await Promise.all([
      fetchYahooMovers("gainers"),
      fetchYahooMovers("losers"),
    ]);

    return NextResponse.json({ gainers, losers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movers", gainers: [], losers: [] },
      { status: 500 }
    );
  }
}
