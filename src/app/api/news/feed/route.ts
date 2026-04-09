import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface FeedItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  ticker: string | null;
  isHighlight: boolean;
}

const RSS_FEEDS = [
  { url: "https://feeds.reuters.com/reuters/businessNews", source: "Reuters" },
  { url: "https://www.cnbc.com/id/10001147/device/rss/rss.html", source: "CNBC" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", source: "Yahoo Finance" },
  { url: "https://seekingalpha.com/market_currents.xml", source: "Seeking Alpha" },
  { url: "https://feeds.benzinga.com/benzinga", source: "Benzinga" },
];

const HIGHLIGHT_KEYWORDS = [
  "beats", "misses", "raises guidance", "lowers guidance",
  "FDA approval", "FDA rejection", "merger", "acquisition",
  "layoffs", "CEO resign", "recall", "earnings",
  "upgrade", "downgrade", "buyback", "bankruptcy",
  "IPO", "offering", "guidance",
];

function extractTicker(title: string): string | null {
  // Look for patterns like (AAPL), $AAPL, or standalone tickers
  const dollarMatch = title.match(/\$([A-Z]{1,5})\b/);
  if (dollarMatch) return dollarMatch[1];

  const parenMatch = title.match(/\(([A-Z]{1,5})\)/);
  if (parenMatch) return parenMatch[1];

  // Look for ticker-like patterns followed by stock-related words
  const contextMatch = title.match(/\b([A-Z]{2,5})\b(?=\s+(?:stock|shares|earnings|revenue|price|rises|falls|drops|surges|plunges))/);
  if (contextMatch) return contextMatch[1];

  return null;
}

function isHighlight(title: string): boolean {
  const lower = title.toLowerCase();
  return HIGHLIGHT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

async function parseRssFeed(feedUrl: string, source: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StockDashboard/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const xml = await res.text();

    // Simple XML parsing for RSS items
    const items: FeedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 20) {
      const itemXml = match[1];

      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

      const title = titleMatch?.[1]?.trim() || "";
      if (!title) continue;

      items.push({
        title,
        link: linkMatch?.[1]?.trim() || "",
        source,
        pubDate: pubDateMatch?.[1] || new Date().toISOString(),
        ticker: extractTicker(title),
        isHighlight: isHighlight(title),
      });
    }

    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const allFeeds = await Promise.allSettled(
      RSS_FEEDS.map((feed) => parseRssFeed(feed.url, feed.source))
    );

    const items: FeedItem[] = allFeeds
      .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 100);

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news", items: [] },
      { status: 500 }
    );
  }
}
