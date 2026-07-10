"use client";

import { useCallback, useState } from "react";

import { useAppData } from "@/hooks/app-data";
import { RaceManager } from "@/components/command-center/RaceManager";
import { CalendarEventManager } from "@/components/calendar/CalendarEventManager";
import { CalendarMiniMonth } from "@/components/calendar/CalendarMiniMonth";
import { CalendarMonthGrid } from "@/components/calendar/CalendarMonthGrid";
import { CalendarDayDetail } from "@/components/calendar/CalendarDayDetail";
import { CalendarUpcomingList } from "@/components/calendar/CalendarUpcomingList";
import { buildCalendarItems } from "@/lib/calendar-utils";
import { CALENDAR_CATEGORY_DOT_STYLES } from "@/components/ui/Badge";
import { CALENDAR_EVENT_CATEGORIES } from "@/types";
import { cn, todayIso } from "@/lib/utils";

function initialPeriod() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function CalendarPage() {
  const { role, loading, currentUser, races, calendarEvents } = useAppData();
  const resolved = !loading && currentUser !== undefined;
  const items = buildCalendarItems(races, calendarEvents);
  const todayDate = todayIso();

  const [{ year, month }, setPeriod] = useState(initialPeriod);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  const navigateMonth = useCallback((direction: -1 | 1) => {
    setPeriod((prev) => {
      let next = prev.month + direction;
      let nextYear = prev.year;
      if (next < 1) {
        next = 12;
        nextYear -= 1;
      } else if (next > 12) {
        next = 1;
        nextYear += 1;
      }
      return { year: nextYear, month: next };
    });
  }, []);

  const selectDay = useCallback((dateIso: string) => {
    setSelectedDate(dateIso);
    const [y, m] = dateIso.split("-").map(Number);
    setPeriod({ year: y, month: m });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          Calendar
        </h1>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          The full club calendar — races, training blocks, socials, public holidays, and
          membership deadlines.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 dark:border-white/10 dark:bg-pitch-900/70">
        {CALENDAR_EVENT_CATEGORIES.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", CALENDAR_CATEGORY_DOT_STYLES[cat])} />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {cat}
            </span>
          </div>
        ))}
      </div>

      {resolved && role === "coach" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CalendarEventManager />
          <RaceManager />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 max-w-2xl xl:max-w-none xl:grid-cols-[18rem_1fr] xl:items-start">
        <div className="flex flex-col gap-4 xl:sticky xl:top-20 xl:col-start-1">
          <CalendarMiniMonth
            year={year}
            month={month}
            items={items}
            selectedDate={selectedDate}
            todayDate={todayDate}
            onNavigateMonth={navigateMonth}
            onSelectDay={selectDay}
          />
          <CalendarUpcomingList items={items} onSelectDay={selectDay} />
        </div>

        <div className="flex flex-col gap-4 xl:col-start-2">
          <CalendarMonthGrid
            year={year}
            month={month}
            items={items}
            selectedDate={selectedDate}
            todayDate={todayDate}
            onSelectDay={selectDay}
          />
          <CalendarDayDetail selectedDate={selectedDate} items={items} />
        </div>
      </div>
    </div>
  );
}
