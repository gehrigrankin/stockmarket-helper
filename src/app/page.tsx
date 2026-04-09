"use client";

import {
  TrendingUp,
  Calendar,
  Newspaper,
  Zap,
  Search,
  Eye,
  Activity,
} from "lucide-react";
import { PreMarketMovers } from "@/components/dashboard/PreMarketMovers";
import { CatalystCalendar } from "@/components/dashboard/CatalystCalendar";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { UnusualOptions } from "@/components/dashboard/UnusualOptions";
import { TickerLookup } from "@/components/dashboard/TickerLookup";
import { Watchlist } from "@/components/dashboard/Watchlist";

const NAV_ITEMS = [
  { id: "movers", label: "Movers", icon: TrendingUp },
  { id: "watchlist", label: "Watchlist", icon: Eye },
  { id: "lookup", label: "Lookup", icon: Search },
  { id: "news", label: "News", icon: Newspaper },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "options", label: "Options", icon: Zap },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tracking-tight">
              StockTerminal
            </span>
          </div>
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1800px] mx-auto p-3 sm:p-4 space-y-3">
        {/* Row 1: Movers (wide) + Watchlist (sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <PreMarketMovers />
          </div>
          <div>
            <Watchlist />
          </div>
        </div>

        {/* Row 2: Ticker Lookup (full width) */}
        <TickerLookup />

        {/* Row 3: News + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <NewsFeed />
          <div className="space-y-3">
            <CatalystCalendar />
            <UnusualOptions />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-2 text-center text-[10px] text-muted-foreground">
        Personal use only — Not financial advice — Data may be delayed
      </footer>
    </div>
  );
}
