import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface UnusualOption {
  ticker: string;
  type: "CALL" | "PUT";
  strike: number;
  expiry: string;
  premium: number;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  isWhaleAlert: boolean;
  volume: number;
  openInterest: number;
}

async function fetchUnusualWhales(): Promise<UnusualOption[]> {
  const apiKey = process.env.UNUSUAL_WHALES_KEY;

  if (!apiKey) {
    // Return demo data when no API key is configured
    return getDemoData();
  }

  try {
    const res = await fetch(
      "https://api.unusualwhales.com/api/option-trades/flow",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "StockDashboard/1.0",
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      return getDemoData();
    }

    const data = await res.json();
    const trades = data?.data || [];

    return trades.slice(0, 30).map((t: Record<string, unknown>) => {
      const premium = Number(t.premium) || 0;
      const type = String(t.put_call || t.type || "").toUpperCase();
      return {
        ticker: String(t.ticker || t.underlying_symbol || ""),
        type: type === "PUT" ? "PUT" : "CALL",
        strike: Number(t.strike_price || t.strike) || 0,
        expiry: String(t.expiration_date || t.expires || ""),
        premium,
        sentiment: type === "CALL" ? "Bullish" : type === "PUT" ? "Bearish" : "Neutral",
        isWhaleAlert: premium >= 500000,
        volume: Number(t.volume) || 0,
        openInterest: Number(t.open_interest) || 0,
      } as UnusualOption;
    });
  } catch {
    return getDemoData();
  }
}

function getDemoData(): UnusualOption[] {
  // Demo data to show the feature's layout when no API key is available
  const demoTickers = [
    { ticker: "NVDA", type: "CALL" as const, strike: 950, expiry: "2025-04-18", premium: 1250000, volume: 12500, oi: 45000 },
    { ticker: "AAPL", type: "CALL" as const, strike: 200, expiry: "2025-04-11", premium: 780000, volume: 8900, oi: 32000 },
    { ticker: "TSLA", type: "PUT" as const, strike: 160, expiry: "2025-04-18", premium: 650000, volume: 15200, oi: 28000 },
    { ticker: "SPY", type: "PUT" as const, strike: 510, expiry: "2025-04-11", premium: 2100000, volume: 45000, oi: 120000 },
    { ticker: "META", type: "CALL" as const, strike: 550, expiry: "2025-04-25", premium: 420000, volume: 6700, oi: 18000 },
    { ticker: "AMD", type: "CALL" as const, strike: 180, expiry: "2025-04-11", premium: 380000, volume: 9800, oi: 22000 },
    { ticker: "AMZN", type: "CALL" as const, strike: 195, expiry: "2025-04-18", premium: 890000, volume: 7200, oi: 35000 },
    { ticker: "GOOGL", type: "PUT" as const, strike: 155, expiry: "2025-04-11", premium: 310000, volume: 4500, oi: 15000 },
    { ticker: "MARA", type: "CALL" as const, strike: 25, expiry: "2025-04-11", premium: 520000, volume: 22000, oi: 55000 },
    { ticker: "PLTR", type: "CALL" as const, strike: 30, expiry: "2025-04-18", premium: 410000, volume: 18000, oi: 42000 },
  ];

  return demoTickers.map((d) => ({
    ticker: d.ticker,
    type: d.type,
    strike: d.strike,
    expiry: d.expiry,
    premium: d.premium,
    sentiment: d.type === "CALL" ? ("Bullish" as const) : ("Bearish" as const),
    isWhaleAlert: d.premium >= 500000,
    volume: d.volume,
    openInterest: d.oi,
  }));
}

export async function GET() {
  try {
    const options = await fetchUnusualWhales();
    const hasApiKey = !!process.env.UNUSUAL_WHALES_KEY;

    return NextResponse.json({
      options,
      isDemo: !hasApiKey,
      message: hasApiKey
        ? undefined
        : "Demo data shown. Set UNUSUAL_WHALES_KEY in .env.local for live data.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch options data", options: [], isDemo: true },
      { status: 500 }
    );
  }
}
