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
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "news", label: "News", icon: Newspaper },
  { id: "options", label: "Options", icon: Zap },
  { id: "lookup", label: "Lookup", icon: Search },
  { id: "watchlist", label: "Watchlist", icon: Eye },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1800px] mx-auto px-4 h-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tracking-tight">
              StockTerminal
            </span>
            <span className="text-[10px] text-muted-foreground">
              Day Trading Research
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
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
      <main className="max-w-[1800px] mx-auto p-4 space-y-3">
        {/* Top row: Movers + Calendar + Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <PreMarketMovers />
          </div>
          <div className="space-y-3">
            <Watchlist />
            <CatalystCalendar />
          </div>
        </div>

        {/* Middle: Ticker Lookup */}
        <TickerLookup />

        {/* Bottom row: News + Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <NewsFeed />
          <UnusualOptions />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-2 text-center text-[10px] text-muted-foreground">
        Personal use only — Not financial advice — Data may be delayed
      </footer>
    </div>
  );
}
