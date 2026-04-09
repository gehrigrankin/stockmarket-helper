"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PREVIEW_COUNT = 5;

async function fetchMovers(): Promise<MoversData> {
  const res = await fetch("/api/market/movers");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function MoverRow({ mover, type }: { mover: Mover; type: "gainer" | "loser" }) {
  const isUp = type === "gainer";
  return (
    <div className="flex items-center justify-between py-1.5 px-1 text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-bold text-sm w-12">{mover.ticker}</span>
        {mover.highActivity && (
          <Activity className="h-3 w-3 text-amber-400 shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-right text-[10px] hidden sm:block w-14">
          {formatNumber(mover.volume)}
        </span>
        <span className="text-right font-mono text-xs w-16">
          {formatCurrency(mover.price)}
        </span>
        <span
          className={`w-16 text-right font-mono font-bold ${
            isUp ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {formatPercent(mover.changePercent)}
        </span>
      </div>
    </div>
  );
}

function MoverList({ movers, type }: { movers: Mover[]; type: "gainer" | "loser" }) {
  const [expanded, setExpanded] = useState(false);
  const isUp = type === "gainer";
  const visible = expanded ? movers : movers.slice(0, PREVIEW_COUNT);
  const hasMore = movers.length > PREVIEW_COUNT;

  return (
    <div>
      <div className={`flex items-center gap-1.5 mb-1 text-[11px] font-semibold px-1 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isUp ? "Gainers" : "Losers"}
      </div>
      {visible.map((m) => (
        <MoverRow key={m.ticker} mover={m} type={type} />
      ))}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-6 text-[10px] text-muted-foreground mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Show less" : `Show all ${movers.length}`}
        </Button>
      )}
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
      description="Stocks with the biggest price swings today. Lightning bolt icon = volume is 2x+ the average, meaning unusual interest."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge="60s"
    >
      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Loading movers...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {gainers.length > 0 ? (
            <MoverList movers={gainers} type="gainer" />
          ) : (
            <div className="text-xs text-muted-foreground py-2 text-center">No gainers data</div>
          )}
          {losers.length > 0 ? (
            <MoverList movers={losers} type="loser" />
          ) : (
            <div className="text-xs text-muted-foreground py-2 text-center">No losers data</div>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}
