"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "stock-watchlist";

export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTickers(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const save = useCallback((updated: string[]) => {
    setTickers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addTicker = useCallback(
    (ticker: string) => {
      const upper = ticker.toUpperCase().trim();
      if (!upper || tickers.includes(upper)) return;
      save([...tickers, upper]);
    },
    [tickers, save]
  );

  const removeTicker = useCallback(
    (ticker: string) => {
      save(tickers.filter((t) => t !== ticker));
    },
    [tickers, save]
  );

  return { tickers, addTicker, removeTicker };
}
