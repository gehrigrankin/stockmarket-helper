import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol param required" }, { status: 400 });
  }

  try {
    // Use Yahoo Finance RSS for ticker-specific news
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StockDashboard/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`RSS returned ${res.status}`);
    }

    const xml = await res.text();
    const items: { title: string; link: string; pubDate: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

      items.push({
        title: titleMatch?.[1]?.trim() || "",
        link: linkMatch?.[1]?.trim() || "",
        pubDate: pubDateMatch?.[1] || "",
      });
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch ticker news", items: [] },
      { status: 500 }
    );
  }
}
