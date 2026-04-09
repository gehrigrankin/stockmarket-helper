"use client";

import { useState } from "react";
import { Newspaper, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useAutoRefresh } from "@/lib/hooks/use-auto-refresh";
import { timeAgo } from "@/lib/utils";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  ticker: string | null;
  isHighlight: boolean;
}

const PREVIEW_COUNT = 5;

async function fetchNews(): Promise<{ items: NewsItem[] }> {
  const res = await fetch("/api/news/feed");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const sourceColors: Record<string, string> = {
  Reuters: "text-orange-400",
  CNBC: "text-blue-400",
  "Yahoo Finance": "text-purple-400",
  "Seeking Alpha": "text-emerald-400",
  Benzinga: "text-cyan-400",
};

export function NewsFeed() {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<{
    items: NewsItem[];
  }>({
    fetchFn: fetchNews,
    intervalMs: 120000,
  });

  const allItems = data?.items || [];
  const items = expanded ? allItems : allItems.slice(0, PREVIEW_COUNT);
  const hasMore = allItems.length > PREVIEW_COUNT;

  return (
    <SectionWrapper
      id="news"
      title="Breaking News"
      icon={<Newspaper className="h-4 w-4" />}
      description="Live headlines from Reuters, CNBC, Yahoo, Seeking Alpha & Benzinga. Yellow CATALYST badge = headline mentions earnings, FDA, mergers, or other market-moving keywords."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge="2m"
    >
      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Loading news...</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-muted-foreground py-6 text-center">No news available</div>
      ) : (
        <div>
          <div className="space-y-0.5">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block py-2 px-2 rounded text-xs hover:bg-muted/50 transition-colors ${
                  item.isHighlight
                    ? "border-l-2 border-amber-500 bg-amber-950/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold ${
                      sourceColors[item.source] || "text-muted-foreground"
                    }`}
                  >
                    {item.source}
                  </span>
                  {item.ticker && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                      ${item.ticker}
                    </Badge>
                  )}
                  {item.isHighlight && (
                    <Badge variant="warning" className="text-[9px] px-1 py-0 h-3.5">
                      CATALYST
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {timeAgo(new Date(item.pubDate))}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed text-[13px]">{item.title}</p>
              </a>
            ))}
          </div>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-[11px] text-muted-foreground mt-1"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Show fewer" : `Show all ${allItems.length} headlines`}
            </Button>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}
