"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  BMO: "Pre",
  AMC: "Post",
  TAS: "",
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
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, lastUpdated, refresh } = useAutoRefresh<{
    events: CalendarEvent[];
  }>({
    fetchFn: fetchCalendar,
    intervalMs: 300000,
  });

  const events = data?.events || [];
  const todayEvents = events.filter((e) => e.isToday);
  const futureEvents = events.filter((e) => !e.isToday);

  // Group future events by date
  const futureGrouped = futureEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  const todayCount = todayEvents.length;
  const futureCount = futureEvents.length;

  return (
    <SectionWrapper
      id="calendar"
      title="Catalyst Calendar"
      icon={<Calendar className="h-4 w-4" />}
      description="Upcoming events that could move stock prices — earnings reports, Fed meetings, etc. Today's events highlighted in gold."
      onRefresh={refresh}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      badge={todayCount > 0 ? `${todayCount} today` : "Today + 3d"}
    >
      {isLoading && !data ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">No upcoming events</div>
      ) : (
        <div>
          {/* Today's events always visible */}
          {todayCount > 0 ? (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-amber-400">Today</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
              </div>
              {todayEvents.slice(0, 5).map((event, i) => (
                <EventRow key={`today-${i}`} event={event} />
              ))}
              {todayEvents.length > 5 && !expanded && (
                <div className="text-[10px] text-muted-foreground px-1 mt-0.5">
                  +{todayEvents.length - 5} more today
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-2 px-1">No events today</div>
          )}

          {/* Future events behind expand */}
          {futureCount > 0 && (
            <>
              {expanded && (
                <div className="space-y-2 mt-2 pt-2 border-t border-border/30">
                  {Object.entries(futureGrouped).map(([date, dateEvents]) => (
                    <div key={date}>
                      <div className="text-[11px] font-semibold text-muted-foreground mb-1 px-1">
                        {formatDate(date)} ({dateEvents.length})
                      </div>
                      {dateEvents.slice(0, 10).map((event, i) => (
                        <EventRow key={`${date}-${i}`} event={event} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-6 text-[10px] text-muted-foreground mt-1"
                onClick={() => setExpanded(!expanded)}
              >
                <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
                {expanded ? "Hide future" : `${futureCount} upcoming events`}
              </Button>
            </>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div
      className={`flex items-center justify-between py-1 px-1.5 rounded text-xs ${
        event.isToday ? "bg-amber-950/20" : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            typeColors[event.type] || "bg-gray-600"
          }`}
        />
        <span className="font-bold w-10">{event.ticker}</span>
        <span className="text-muted-foreground truncate text-[11px]">{event.company}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {event.time && timeLabels[event.time] && (
          <span className="text-[10px] text-muted-foreground">{timeLabels[event.time]}</span>
        )}
        <Badge variant="secondary" className="text-[9px] px-1 py-0">
          {event.type === "earnings" ? "ERN" : event.type.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
}
