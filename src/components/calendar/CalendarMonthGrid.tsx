"use client";

import { CALENDAR_CATEGORY_DOT_STYLES } from "@/components/ui/Badge";
import { buildMonthGridCells, itemsForDay, type CalendarItem } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 2;

export function CalendarMonthGrid({
  year,
  month,
  items,
  selectedDate,
  todayDate,
  onSelectDay,
}: {
  year: number;
  month: number; // 1-indexed
  items: CalendarItem[];
  selectedDate: string | null;
  todayDate: string;
  onSelectDay: (dateIso: string) => void;
}) {
  const cells = buildMonthGridCells(year, month);

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-white/10 dark:bg-pitch-900/70 md:block">
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/10">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return (
              <div
                key={`b-${i}`}
                className="min-h-24 border-b border-r border-slate-100 dark:border-white/10"
              />
            );
          }
          const dateIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayItems = itemsForDay(items, dateIso);
          const isSelected = dateIso === selectedDate;
          const isToday = dateIso === todayDate;
          const visible = dayItems.slice(0, MAX_CHIPS_PER_DAY);
          const overflow = dayItems.length - visible.length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(dateIso)}
              className={cn(
                "min-h-24 flex flex-col items-stretch gap-1 border-b border-r border-slate-100 p-1.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 dark:border-white/10 dark:hover:bg-white/5",
                isSelected && "bg-green-50 dark:bg-green-500/10"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isSelected
                    ? "bg-green-700 text-white"
                    : isToday
                      ? "text-green-700 dark:text-green-400"
                      : "text-slate-700 dark:text-slate-200"
                )}
              >
                {day}
              </span>
              <div className="flex flex-col gap-0.5">
                {visible.map((item) => (
                  <span
                    key={item.id}
                    className="flex items-center gap-1 truncate text-[10px] font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        CALENDAR_CATEGORY_DOT_STYLES[item.category]
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </span>
                ))}
                {overflow > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    +{overflow} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
