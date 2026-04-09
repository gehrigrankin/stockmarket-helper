"use client";

import { Zap, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionWrapper } from "./SectionWrapper";
import { useAutoRefresh } from "@/lib/hooks/use-auto-refresh";
import { formatCurrency, formatNumber } from "@/lib/utils";

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

export function UnusualOptions() {
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<OptionsData>({
    fetchFn: fetchOptions,
    intervalMs: 120000,
  });

  const options = data?.options || [];

  return (
    <SectionWrapper
      id="options"
      title="Unusual Options Activity"
      icon={<Zap className="h-4 w-4" />}
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge={data?.isDemo ? "DEMO" : "LIVE"}
    >
      {data?.isDemo && (
        <div className="text-[10px] text-amber-400/80 bg-amber-950/20 rounded px-2 py-1 mb-2">
          {data.message}
        </div>
      )}

      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-4 text-center">Loading options flow...</div>
      ) : (
        <ScrollArea className="h-[300px]">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground text-[10px] border-b border-border/50">
                <th className="text-left py-1.5 px-2 font-medium">Ticker</th>
                <th className="text-left py-1.5 px-1 font-medium">Type</th>
                <th className="text-right py-1.5 px-1 font-medium">Strike</th>
                <th className="text-right py-1.5 px-1 font-medium">Expiry</th>
                <th className="text-right py-1.5 px-1 font-medium">Premium</th>
                <th className="text-right py-1.5 px-1 font-medium">Vol</th>
                <th className="text-left py-1.5 px-1 font-medium">Signal</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt, i) => (
                <tr
                  key={i}
                  className={`border-b border-border/20 hover:bg-muted/50 ${
                    opt.isWhaleAlert ? "bg-amber-950/20" : ""
                  }`}
                >
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{opt.ticker}</span>
                      {opt.isWhaleAlert && (
                        <AlertTriangle className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 px-1">
                    <Badge
                      variant={opt.type === "CALL" ? "success" : "destructive"}
                      className="text-[9px] px-1 py-0"
                    >
                      {opt.type}
                    </Badge>
                  </td>
                  <td className="py-1.5 px-1 text-right font-mono">
                    ${opt.strike}
                  </td>
                  <td className="py-1.5 px-1 text-right text-muted-foreground">
                    {new Date(opt.expiry).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-1.5 px-1 text-right font-mono font-semibold">
                    {formatCurrency(opt.premium)}
                  </td>
                  <td className="py-1.5 px-1 text-right text-muted-foreground">
                    {formatNumber(opt.volume)}
                  </td>
                  <td className="py-1.5 px-1">
                    <span
                      className={`font-semibold ${
                        opt.sentiment === "Bullish"
                          ? "text-emerald-400"
                          : opt.sentiment === "Bearish"
                          ? "text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {opt.sentiment}
                    </span>
                    {opt.isWhaleAlert && (
                      <span className="text-amber-400 ml-1 text-[9px]">WHALE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
    </SectionWrapper>
  );
}
