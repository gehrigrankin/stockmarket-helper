"use client";

import { Newspaper, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<{
    items: NewsItem[];
  }>({
    fetchFn: fetchNews,
    intervalMs: 120000,
  });

  const items = data?.items || [];

  return (
    <SectionWrapper
      id="news"
      title="Breaking News"
      icon={<Newspaper className="h-4 w-4" />}
      description="Live headlines from Reuters, CNBC, Yahoo, Seeking Alpha & Benzinga. Yellow CATALYST badge = headline mentions earnings, FDA, mergers, or other market-moving keywords."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge="2m refresh"
    >
      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-8 text-center">Loading news...</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-muted-foreground py-8 text-center">No news available</div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-0.5">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block py-2 px-2 rounded text-xs hover:bg-muted/50 transition-colors group ${
                  item.isHighlight
                    ? "border-l-2 border-amber-500 bg-amber-950/20"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold ${
                          sourceColors[item.source] || "text-muted-foreground"
                        }`}
                      >
                        {item.source}
                      </span>
                      {item.ticker && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-3.5"
                        >
                          ${item.ticker}
                        </Badge>
                      )}
                      {item.isHighlight && (
                        <Badge
                          variant="warning"
                          className="text-[9px] px-1 py-0 h-3.5"
                        >
                          CATALYST
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground sm:hidden">
                        {timeAgo(new Date(item.pubDate))}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed text-[13px]">{item.title}</p>
                  </div>
                  <div className="items-center gap-1 shrink-0 hidden sm:flex">
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(new Date(item.pubDate))}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      )}
    </SectionWrapper>
  );
}
