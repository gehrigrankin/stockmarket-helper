"use client";

import { useState } from "react";
import { Zap, AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useAutoRefresh } from "@/lib/hooks/use-auto-refresh";

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

interface OptionsData {
  options: UnusualOption[];
  isDemo: boolean;
  message?: string;
}

const PREVIEW_COUNT = 3;

async function fetchOptions(): Promise<OptionsData> {
  const res = await fetch("/api/options/unusual");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function formatPremium(num: number): string {
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function OptionCard({ opt }: { opt: UnusualOption }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2 rounded text-xs ${
        opt.isWhaleAlert ? "bg-amber-950/20 border border-amber-800/30" : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-bold w-10">{opt.ticker}</span>
        <Badge
          variant={opt.type === "CALL" ? "success" : "destructive"}
          className="text-[9px] px-1 py-0"
        >
          {opt.type}
        </Badge>
        {opt.isWhaleAlert && (
          <AlertTriangle className="h-3 w-3 text-amber-400" />
        )}
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-muted-foreground">${opt.strike}</span>
        <span className="font-mono font-semibold">{formatPremium(opt.premium)}</span>
        <span
          className={`font-semibold w-12 text-right ${
            opt.sentiment === "Bullish" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {opt.sentiment === "Bullish" ? "Bull" : "Bear"}
        </span>
      </div>
    </div>
  );
}

export function UnusualOptions() {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<OptionsData>({
    fetchFn: fetchOptions,
    intervalMs: 120000,
  });

  // Sort whale alerts first
  const allOptions = [...(data?.options || [])].sort(
    (a, b) => (b.isWhaleAlert ? 1 : 0) - (a.isWhaleAlert ? 1 : 0) || b.premium - a.premium
  );
  const options = expanded ? allOptions : allOptions.slice(0, PREVIEW_COUNT);
  const hasMore = allOptions.length > PREVIEW_COUNT;

  return (
    <SectionWrapper
      id="options"
      title="Unusual Options"
      icon={<Zap className="h-4 w-4" />}
      description="Large options bets that may signal where institutional money is positioning. Triangle icon = whale alert (premium over $500K). Calls = bullish, Puts = bearish."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge={data?.isDemo ? "DEMO" : "LIVE"}
    >
      {data?.isDemo && (
        <div className="text-[10px] text-amber-400/70 mb-2">
          Demo data — add UNUSUAL_WHALES_KEY for live flow
        </div>
      )}

      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Loading...</div>
      ) : (
        <div>
          <div className="space-y-0.5">
            {options.map((opt, i) => (
              <OptionCard key={i} opt={opt} />
            ))}
          </div>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-6 text-[10px] text-muted-foreground mt-1"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Show less" : `Show all ${allOptions.length}`}
            </Button>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}
