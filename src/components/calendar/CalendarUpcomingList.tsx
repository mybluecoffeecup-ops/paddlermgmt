"use client";

import { useState } from "react";
import { ChevronDown, ListTodo } from "lucide-react";

import { CalendarEventRow } from "@/components/calendar/CalendarEventRow";
import { cn, todayIso } from "@/lib/utils";
import { upcomingItems, type CalendarItem } from "@/lib/calendar-utils";

const UPCOMING_LIMIT = 10;

export function CalendarUpcomingList({
  items,
  onSelectDay,
}: {
  items: CalendarItem[];
  onSelectDay: (dateIso: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const upcoming = upcomingItems(items, todayIso(), UPCOMING_LIMIT);

  return (
    <div className="rounded-2xl border border-green-700/15 bg-green-500/[0.06] p-3 dark:border-green-400/20 dark:bg-green-400/10">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 xl:cursor-default"
      >
        <span className="flex items-center gap-2">
          <ListTodo size={13} />
          Upcoming
          <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-300">
            {upcoming.length}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn("transition-transform xl:hidden", isOpen && "rotate-180")}
        />
      </button>

      <div className={cn("flex-col gap-1.5 pt-3 xl:flex", isOpen ? "flex" : "hidden")}>
        {upcoming.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Nothing upcoming.
          </p>
        ) : (
          <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto pr-1">
            {upcoming.map((item) => (
              <CalendarEventRow key={item.id} item={item} showDate onSelect={onSelectDay} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
