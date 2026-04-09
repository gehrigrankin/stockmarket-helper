import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol param required" }, { status: 400 });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=defaultKeyStatistics,summaryDetail,price`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Yahoo stats API returned ${res.status}`);
    }

    const data = await res.json();
    const result = data?.quoteSummary?.result?.[0];
    const stats = result?.defaultKeyStatistics || {};
    const summary = result?.summaryDetail || {};
    const price = result?.price || {};

    return NextResponse.json({
      shortName: price?.shortName?.raw || price?.shortName || symbol,
      floatShares: stats?.floatShares?.raw || null,
      sharesShort: stats?.sharesShort?.raw || null,
      shortPercentOfFloat: stats?.shortPercentOfFloat?.raw || null,
      avgVolume: summary?.averageDailyVolume10Day?.raw || null,
      fiftyTwoWeekHigh: summary?.fiftyTwoWeekHigh?.raw || null,
      fiftyTwoWeekLow: summary?.fiftyTwoWeekLow?.raw || null,
      marketCap: price?.marketCap?.raw || null,
      beta: stats?.beta?.raw || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
