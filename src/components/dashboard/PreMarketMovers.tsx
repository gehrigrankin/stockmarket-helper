"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionWrapper } from "./SectionWrapper";
import { useAutoRefresh } from "@/lib/hooks/use-auto-refresh";
import { formatPercent, formatNumber, formatCurrency } from "@/lib/utils";

interface Mover {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  highActivity: boolean;
}

interface MoversData {
  gainers: Mover[];
  losers: Mover[];
}

async function fetchMovers(): Promise<MoversData> {
  const res = await fetch("/api/market/movers");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function MoverRow({ mover, type }: { mover: Mover; type: "gainer" | "loser" }) {
  const isUp = type === "gainer";
  return (
    <div className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded text-xs border-b border-border/20 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-sm w-14">{mover.ticker}</span>
        {mover.highActivity && (
          <Badge variant="warning" className="text-[9px] px-1 py-0 gap-0.5">
            <Activity className="h-2.5 w-2.5" />
            HIGH VOL
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-muted-foreground text-right text-[10px] hidden sm:block">
          {formatNumber(mover.volume)}
        </span>
        <span className="text-right font-mono text-xs">
          {formatCurrency(mover.price)}
        </span>
        <span
          className={`w-16 text-right font-mono font-bold text-sm ${
            isUp ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {formatPercent(mover.changePercent)}
        </span>
      </div>
    </div>
  );
}

export function PreMarketMovers() {
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<MoversData>({
    fetchFn: fetchMovers,
    intervalMs: 60000,
  });

  const gainers = data?.gainers || [];
  const losers = data?.losers || [];

  return (
    <SectionWrapper
      id="movers"
      title="Top Movers"
      icon={<TrendingUp className="h-4 w-4" />}
      description="Stocks with the biggest price swings today. Orange HIGH VOL badge = volume is 2x+ the average, meaning unusual interest."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge="60s refresh"
    >
      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-8 text-center">Loading movers...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-emerald-400 px-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Gainers
            </div>
            <ScrollArea className="h-[280px]">
              {gainers.length > 0 ? (
                gainers.map((m) => (
                  <MoverRow key={m.ticker} mover={m} type="gainer" />
                ))
              ) : (
                <div className="text-xs text-muted-foreground py-4 text-center">No data available</div>
              )}
            </ScrollArea>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-red-400 px-2">
              <TrendingDown className="h-3.5 w-3.5" />
              Losers
            </div>
            <ScrollArea className="h-[280px]">
              {losers.length > 0 ? (
                losers.map((m) => (
                  <MoverRow key={m.ticker} mover={m} type="loser" />
                ))
              ) : (
                <div className="text-xs text-muted-foreground py-4 text-center">No data available</div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
