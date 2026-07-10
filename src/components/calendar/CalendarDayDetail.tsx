import { CalendarSearch } from "lucide-react";

import { CalendarEventRow } from "@/components/calendar/CalendarEventRow";
import { itemsForDay, type CalendarItem } from "@/lib/calendar-utils";

function formatDayHeading(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function CalendarDayDetail({
  selectedDate,
  items,
}: {
  selectedDate: string | null;
  items: CalendarItem[];
}) {
  const dayItems = selectedDate ? itemsForDay(items, selectedDate) : [];

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-pitch-900/70">
      <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
        {selectedDate ? formatDayHeading(selectedDate) : "Select a day"}
      </h3>
      {dayItems.length === 0 ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <CalendarSearch size={16} />
          {selectedDate ? "Nothing scheduled." : "Tap a day to see what's on."}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {dayItems.map((item) => (
            <CalendarEventRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
