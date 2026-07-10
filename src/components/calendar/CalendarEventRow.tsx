import Link from "next/link";

import { CalendarCategoryBadge } from "@/components/ui/Badge";
import { formatDateRange, type CalendarItem } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

export function CalendarEventRow({
  item,
  onSelect,
  showDate,
}: {
  item: CalendarItem;
  /** called for non-race items, to jump the calendar view to this item's date */
  onSelect?: (dateIso: string) => void;
  /** show the item's date range as a caption (used by Upcoming, where rows span many days) */
  showDate?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 dark:border-white/10 dark:bg-pitch-900/70",
        (item.href || onSelect) &&
          "transition-colors hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
      )}
    >
      <div className="min-w-0">
        {showDate && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {formatDateRange(item.startDate, item.endDate)}
          </p>
        )}
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {item.title}
        </p>
      </div>
      <CalendarCategoryBadge category={item.category} />
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        {content}
      </Link>
    );
  }

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(item.startDate)}
        className="block w-full text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        {content}
      </button>
    );
  }

  return content;
}
