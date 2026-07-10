"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

import { CALENDAR_CATEGORY_DOT_STYLES } from "@/components/ui/Badge";
import { MONTH_NAMES, buildMonthGridCells, datesWithItems, type CalendarItem } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";
import type { CalendarEventCategory } from "@/types";

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

/** Picks one representative category (for the dot color) when a day has several. */
const CATEGORY_PRIORITY: CalendarEventCategory[] = [
  "Race",
  "Deadline",
  "Training",
  "Social",
  "Meeting",
  "Holiday",
  "Other",
];

function dotCategoryFor(dateIso: string, items: CalendarItem[]): CalendarEventCategory | null {
  const covering = items.filter((item) => item.startDate <= dateIso && item.endDate >= dateIso);
  if (covering.length === 0) return null;
  for (const cat of CATEGORY_PRIORITY) {
    if (covering.some((item) => item.category === cat)) return cat;
  }
  return covering[0].category;
}

export function CalendarMiniMonth({
  year,
  month,
  items,
  selectedDate,
  todayDate,
  onNavigateMonth,
  onSelectDay,
}: {
  year: number;
  month: number; // 1-indexed
  items: CalendarItem[];
  selectedDate: string | null;
  todayDate: string;
  onNavigateMonth: (direction: -1 | 1) => void;
  onSelectDay: (dateIso: string) => void;
}) {
  const cells = buildMonthGridCells(year, month);
  const eventDates = datesWithItems(items);

  return (
    <div className="rounded-2xl border border-green-700/15 bg-green-500/[0.06] p-3 dark:border-green-400/20 dark:bg-green-400/10">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigateMonth(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <ChevronUp size={15} />
          </button>
          <button
            type="button"
            onClick={() => onNavigateMonth(1)}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LETTERS.map((letter, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            {letter}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`b-${i}`} />;
          const dateIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const cat = eventDates.has(dateIso) ? dotCategoryFor(dateIso, items) : null;
          const isSelected = dateIso === selectedDate;
          const isToday = dateIso === todayDate;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(dateIso)}
              className="flex flex-col items-center gap-0.5 py-1 focus-visible:outline-none"
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isSelected
                    ? "bg-green-700 text-white"
                    : isToday
                      ? "text-green-700 dark:text-green-400"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                )}
              >
                {day}
              </span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  cat ? CALENDAR_CATEGORY_DOT_STYLES[cat] : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
