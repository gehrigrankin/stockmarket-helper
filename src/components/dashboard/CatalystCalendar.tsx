"use client";

import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionWrapper } from "./SectionWrapper";
import { useAutoRefresh } from "@/lib/hooks/use-auto-refresh";

interface CalendarEvent {
  type: "earnings" | "fda" | "fed" | "economic";
  company: string;
  ticker: string;
  date: string;
  time: string;
  epsEstimate: number | null;
  isToday: boolean;
}

async function fetchCalendar(): Promise<{ events: CalendarEvent[] }> {
  const res = await fetch("/api/calendar");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const typeColors: Record<string, string> = {
  earnings: "bg-blue-600",
  fda: "bg-purple-600",
  fed: "bg-amber-600",
  economic: "bg-cyan-600",
};

const timeLabels: Record<string, string> = {
  BMO: "Before Open",
  AMC: "After Close",
  TAS: "—",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function CatalystCalendar() {
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<{
    events: CalendarEvent[];
  }>({
    fetchFn: fetchCalendar,
    intervalMs: 300000, // 5 min
  });

  const events = data?.events || [];

  // Group by date
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  return (
    <SectionWrapper
      id="calendar"
      title="Catalyst Calendar"
      icon={<Calendar className="h-4 w-4" />}
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge="Today + 3 days"
    >
      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-4 text-center">Loading calendar...</div>
      ) : events.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">No upcoming events found</div>
      ) : (
        <ScrollArea className="h-[300px]">
          {Object.entries(grouped).map(([date, dateEvents]) => (
            <div key={date} className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-xs font-semibold ${
                    dateEvents[0]?.isToday ? "text-amber-400" : "text-muted-foreground"
                  }`}
                >
                  {formatDate(date)}
                </span>
                {dateEvents[0]?.isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
                )}
                <span className="text-[10px] text-muted-foreground">
                  ({dateEvents.length})
                </span>
              </div>
              {dateEvents.slice(0, 20).map((event, i) => (
                <div
                  key={`${event.ticker}-${i}`}
                  className={`flex items-center justify-between py-1 px-2 rounded text-xs ${
                    event.isToday
                      ? "bg-amber-950/30 border border-amber-800/30"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        typeColors[event.type] || "bg-gray-600"
                      }`}
                    />
                    <span className="font-bold w-12">{event.ticker}</span>
                    <span className="text-muted-foreground truncate max-w-[160px]">
                      {event.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] px-1">
                      {event.type.toUpperCase()}
                    </Badge>
                    <span className="text-muted-foreground w-16 text-right text-[10px]">
                      {timeLabels[event.time] || event.time}
                    </span>
                    {event.epsEstimate != null && (
                      <span className="text-muted-foreground w-16 text-right text-[10px]">
                        EPS: {event.epsEstimate.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
      )}
    </SectionWrapper>
  );
}
