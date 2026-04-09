import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CalendarEvent {
  type: "earnings" | "fda" | "fed" | "economic";
  company: string;
  ticker: string;
  date: string;
  time: string; // "BMO" (before market open), "AMC" (after market close), "TAS" (time not supplied)
  epsEstimate: number | null;
  isToday: boolean;
}

async function fetchEarningsCalendar(): Promise<CalendarEvent[]> {
  const today = new Date();
  const events: CalendarEvent[] = [];

  // Fetch earnings for today + next 3 days
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/calendar/earnings?formatted=true&lang=en-US&region=US&date=${dateStr}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const earnings = data?.finance?.result || [];

      for (const event of earnings) {
        const rows = event?.rows || [];
        for (const row of rows) {
          events.push({
            type: "earnings",
            company: row.companyshortname || row.ticker || "",
            ticker: row.ticker || "",
            date: dateStr,
            time: row.startdatetimetype || "TAS",
            epsEstimate: row.epsestimate != null ? Number(row.epsestimate) : null,
            isToday: i === 0,
          });
        }
      }
    } catch {
      // continue to next day
    }
  }

  return events;
}

function getStaticEvents(): CalendarEvent[] {
  const today = new Date();
  const events: CalendarEvent[] = [];

  // Known recurring events - FOMC meetings, etc.
  // These are static/hardcoded for the current period
  const fedMeetings2024 = [
    "2025-01-28", "2025-01-29",
    "2025-03-18", "2025-03-19",
    "2025-05-06", "2025-05-07",
    "2025-06-17", "2025-06-18",
    "2025-07-29", "2025-07-30",
    "2025-09-16", "2025-09-17",
    "2025-10-28", "2025-10-29",
    "2025-12-09", "2025-12-10",
    "2026-01-27", "2026-01-28",
    "2026-03-17", "2026-03-18",
    "2026-04-28", "2026-04-29",
    "2026-06-16", "2026-06-17",
  ];

  for (const dateStr of fedMeetings2024) {
    const meetingDate = new Date(dateStr);
    const diffDays = Math.floor(
      (meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 0 && diffDays <= 3) {
      events.push({
        type: "fed",
        company: "Federal Reserve",
        ticker: "FOMC",
        date: dateStr,
        time: "TAS",
        epsEstimate: null,
        isToday: diffDays === 0,
      });
    }
  }

  return events;
}

export async function GET() {
  try {
    const [earnings, staticEvents] = await Promise.all([
      fetchEarningsCalendar(),
      Promise.resolve(getStaticEvents()),
    ]);

    const events = [...earnings, ...staticEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch calendar", events: [] },
      { status: 500 }
    );
  }
}
