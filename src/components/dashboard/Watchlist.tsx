"use client";

import { useState, useCallback, useEffect } from "react";
import { Eye, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface WatchlistQuote {
  symbol: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
}

export function Watchlist() {
  const { tickers, addTicker, removeTicker } = useWatchlist();
  const [input, setInput] = useState("");
  const [quotes, setQuotes] = useState<WatchlistQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQuotes = useCallback(async () => {
    if (tickers.length === 0) {
      setQuotes([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/market/quote?symbols=${tickers.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setQuotes(data.quotes || []);
      setLastUpdated(new Date());
    } catch {
      // keep existing quotes on error
    } finally {
      setIsLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  const handleAdd = () => {
    if (input.trim()) {
      addTicker(input);
      setInput("");
    }
  };

  return (
    <SectionWrapper
      id="watchlist"
      title="Watchlist"
      icon={<Eye className="h-4 w-4" />}
      onRefresh={fetchQuotes}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      description="Your personal tickers. Prices update every 30s. Saved in your browser."
      badge={`${tickers.length} tickers`}
    >
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Add ticker..."
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="font-mono text-sm h-8 max-w-[160px]"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          className="h-8"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {tickers.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">
          Add tickers to your watchlist to track them
        </div>
      ) : (
        <div className="space-y-0.5">
          {tickers.map((ticker) => {
            const quote = quotes.find((q) => q.symbol === ticker);
            const isUp = (quote?.changePercent || 0) >= 0;

            return (
              <div
                key={ticker}
                className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/50 rounded text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm w-12">{ticker}</span>
                  {quote && (
                    <span className="text-muted-foreground text-[10px] truncate max-w-[100px]">
                      {quote.shortName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {quote ? (
                    <>
                      <span className="font-mono w-16 text-right">
                        {formatCurrency(quote.price)}
                      </span>
                      <span
                        className={`font-mono font-semibold w-16 text-right flex items-center justify-end gap-0.5 ${
                          isUp ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(quote.changePercent)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground w-32 text-right">
                      {isLoading ? "Loading..." : "—"}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTicker(ticker)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
