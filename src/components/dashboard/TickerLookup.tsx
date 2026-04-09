"use client";

import { useState, useCallback } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface QuoteData {
  symbol: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
}

interface StatsData {
  shortName: string;
  floatShares: number | null;
  sharesShort: number | null;
  shortPercentOfFloat: number | null;
  avgVolume: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  marketCap: number | null;
}

interface ChartPoint {
  time: number;
  price: number;
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

interface LookupState {
  quote: QuoteData | null;
  stats: StatsData | null;
  chart: ChartPoint[];
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
}

export function TickerLookup() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<LookupState>({
    quote: null,
    stats: null,
    chart: [],
    news: [],
    isLoading: false,
    error: null,
  });

  const lookup = useCallback(async (ticker?: string) => {
    const symbol = (ticker || input).toUpperCase().trim();
    if (!symbol) return;

    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const [quoteRes, statsRes, chartRes, newsRes] = await Promise.allSettled([
        fetch(`/api/market/quote?symbols=${symbol}`).then((r) => r.json()),
        fetch(`/api/market/stats?symbol=${symbol}`).then((r) => r.json()),
        fetch(`/api/market/chart?symbol=${symbol}`).then((r) => r.json()),
        fetch(`/api/news/ticker?symbol=${symbol}`).then((r) => r.json()),
      ]);

      const quote =
        quoteRes.status === "fulfilled"
          ? quoteRes.value?.quotes?.[0] || null
          : null;
      const stats =
        statsRes.status === "fulfilled" ? statsRes.value : null;
      const chart =
        chartRes.status === "fulfilled" ? chartRes.value?.points || [] : [];
      const news =
        newsRes.status === "fulfilled" ? newsRes.value?.items || [] : [];

      if (!quote) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: `No data found for ${symbol}`,
        }));
        return;
      }

      setState({ quote, stats, chart, news, isLoading: false, error: null });
    } catch {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Failed to fetch data",
      }));
    }
  }, [input]);

  const { quote, stats, chart, news, isLoading, error } = state;
  const isUp = (quote?.changePercent || 0) >= 0;

  return (
    <SectionWrapper
      id="lookup"
      title="Quick Ticker Lookup"
      icon={<Search className="h-4 w-4" />}
    >
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Enter ticker (e.g. AAPL)"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          className="font-mono text-sm h-8 max-w-[200px]"
        />
        <Button size="sm" onClick={() => lookup()} disabled={isLoading} className="h-8">
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="text-xs text-red-400 py-2">{error}</div>
      )}

      {quote && (
        <div className="space-y-3">
          {/* Price header */}
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold">{quote.symbol}</span>
            <span className="text-sm text-muted-foreground">{quote.shortName}</span>
            <span className="text-xl font-bold font-mono">
              {formatCurrency(quote.price)}
            </span>
            <span
              className={`text-sm font-semibold font-mono flex items-center gap-1 ${
                isUp ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {formatPercent(quote.changePercent)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Mini chart */}
            <div className="lg:col-span-1">
              <div className="text-[10px] text-muted-foreground mb-1">5-Day Price</div>
              <MiniChart points={chart} isUp={isUp} />
            </div>

            {/* Key stats */}
            <div className="lg:col-span-1">
              <div className="text-[10px] text-muted-foreground mb-1">Key Stats</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <StatRow label="Float" value={stats?.floatShares ? formatNumber(stats.floatShares) : "N/A"} />
                <StatRow label="Short %" value={stats?.shortPercentOfFloat ? `${(stats.shortPercentOfFloat * 100).toFixed(1)}%` : "N/A"} />
                <StatRow label="Avg Vol" value={stats?.avgVolume ? formatNumber(stats.avgVolume) : "N/A"} />
                <StatRow label="Mkt Cap" value={stats?.marketCap ? formatNumber(stats.marketCap) : "N/A"} />
                <StatRow label="52w High" value={stats?.fiftyTwoWeekHigh ? formatCurrency(stats.fiftyTwoWeekHigh) : "N/A"} />
                <StatRow label="52w Low" value={stats?.fiftyTwoWeekLow ? formatCurrency(stats.fiftyTwoWeekLow) : "N/A"} />
                <StatRow label="Day High" value={formatCurrency(quote.dayHigh)} />
                <StatRow label="Day Low" value={formatCurrency(quote.dayLow)} />
              </div>
            </div>

            {/* Ticker news */}
            <div className="lg:col-span-1">
              <div className="text-[10px] text-muted-foreground mb-1">Recent News</div>
              <div className="space-y-1 max-h-[140px] overflow-y-auto">
                {news.length > 0 ? (
                  news.slice(0, 6).map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[11px] text-foreground hover:text-primary leading-snug truncate"
                    >
                      {item.title}
                    </a>
                  ))
                ) : (
                  <div className="text-[11px] text-muted-foreground">No recent news</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function MiniChart({ points, isUp }: { points: ChartPoint[]; isUp: boolean }) {
  if (points.length < 2) {
    return (
      <div className="h-[120px] bg-muted/30 rounded flex items-center justify-center text-[10px] text-muted-foreground">
        No chart data
      </div>
    );
  }

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 300;
  const height = 120;
  const padding = 4;

  const pathPoints = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.price - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${pathPoints.join(" L ")}`;
  const color = isUp ? "#34d399" : "#f87171";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[120px]">
      <defs>
        <linearGradient id={`grad-${isUp}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path
        d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
        fill={`url(#grad-${isUp})`}
      />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />
      {/* Price labels */}
      <text x={width - padding} y="12" textAnchor="end" fill="#888" fontSize="9">
        {max.toFixed(2)}
      </text>
      <text x={width - padding} y={height - 4} textAnchor="end" fill="#888" fontSize="9">
        {min.toFixed(2)}
      </text>
    </svg>
  );
}
