"use client";

import { Zap, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionWrapper } from "./SectionWrapper";
import { useAutoRefresh } from "@/lib/hooks/use-auto-refresh";
import { formatNumber } from "@/lib/utils";

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

export function UnusualOptions() {
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<OptionsData>({
    fetchFn: fetchOptions,
    intervalMs: 120000,
  });

  const options = data?.options || [];

  return (
    <SectionWrapper
      id="options"
      title="Unusual Options"
      icon={<Zap className="h-4 w-4" />}
      description="Large options bets that may signal where institutional money is positioning. Whale alert = premium over $500K. Calls are bullish bets, puts are bearish."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge={data?.isDemo ? "DEMO" : "LIVE"}
    >
      {data?.isDemo && (
        <div className="text-[11px] text-amber-400/80 bg-amber-950/20 rounded px-3 py-1.5 mb-3">
          Demo data — set UNUSUAL_WHALES_KEY in .env.local for live options flow
        </div>
      )}

      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-8 text-center">Loading options flow...</div>
      ) : (
        <ScrollArea className="h-[350px]">
          <div className="space-y-1.5">
            {options.map((opt, i) => (
              <div
                key={i}
                className={`rounded-md border p-2.5 text-xs ${
                  opt.isWhaleAlert
                    ? "border-amber-800/50 bg-amber-950/20"
                    : "border-border/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{opt.ticker}</span>
                    <Badge
                      variant={opt.type === "CALL" ? "success" : "destructive"}
                      className="text-[9px] px-1.5 py-0"
                    >
                      {opt.type}
                    </Badge>
                    {opt.isWhaleAlert && (
                      <Badge variant="warning" className="text-[9px] px-1.5 py-0 gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        WHALE
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      opt.sentiment === "Bullish"
                        ? "text-emerald-400"
                        : opt.sentiment === "Bearish"
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {opt.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>
                    Strike <span className="text-foreground font-mono">${opt.strike}</span>
                  </span>
                  <span>
                    Exp{" "}
                    <span className="text-foreground">
                      {new Date(opt.expiry).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                  <span>
                    Premium{" "}
                    <span className="text-foreground font-mono font-semibold">
                      {formatPremium(opt.premium)}
                    </span>
                  </span>
                  <span className="hidden sm:inline">
                    Vol <span className="text-foreground">{formatNumber(opt.volume)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </SectionWrapper>
  );
}
