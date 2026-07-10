import { cn } from "@/lib/utils";
import type { AttendanceStatus, CalendarEventCategory, Discipline } from "@/types";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

// Soft tinted pills — strong solid color is reserved for meaningful,
// singular moments (e.g. an active RSVP selection), not passive repeated
// labels like these, which appear many times per screen (roster rows,
// race lists). Contrast-verified: dark text tints hit AAA on their own
// light wash in light mode; dark mode swaps to white text since the same
// translucent wash reads much darker over the dark Pitch surface.
const STATUS_STYLES: Record<AttendanceStatus, string> = {
  Going: "bg-green-500/15 text-green-800 dark:bg-green-400/20 dark:text-white",
  Maybe: "border border-slate-300 text-slate-700 dark:border-white/30 dark:text-white",
  "Not Going": "bg-redcard-500/15 text-redcard-700 dark:bg-redcard-500/25 dark:text-white",
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{status}</Badge>;
}

const DISCIPLINE_STYLES: Record<Discipline, string> = {
  DB: "bg-green-500/15 text-green-800 dark:bg-green-400/20 dark:text-white",
  OC: "bg-gold-500/20 text-gold-900 dark:bg-gold-400/25 dark:text-white",
  Both: "bg-pitch-900/10 text-pitch-900 dark:bg-white/10 dark:text-white",
};

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  return <Badge className={DISCIPLINE_STYLES[discipline]}>{discipline}</Badge>;
}

// Shared with CalendarYearNav's event dots, so the two stay in sync — a
// category's color means the same thing whether it's a dot in the mini-grid
// nav or a badge in the month agenda.
export const CALENDAR_CATEGORY_STYLES: Record<CalendarEventCategory, string> = {
  Race: "bg-green-500/15 text-green-800 dark:bg-green-400/20 dark:text-white",
  Training: "bg-pitch-900/10 text-pitch-900 dark:bg-white/10 dark:text-white",
  Social: "bg-gold-500/20 text-gold-900 dark:bg-gold-400/25 dark:text-white",
  Deadline: "bg-gold-500/20 text-gold-900 dark:bg-gold-400/25 dark:text-white",
  Meeting: "border border-slate-300 text-slate-700 dark:border-white/30 dark:text-white",
  Holiday: "border border-slate-300 text-slate-700 dark:border-white/30 dark:text-white",
  Other: "border border-slate-300 text-slate-700 dark:border-white/30 dark:text-white",
};

export const CALENDAR_CATEGORY_DOT_STYLES: Record<CalendarEventCategory, string> = {
  Race: "bg-green-600 dark:bg-green-400",
  Training: "bg-pitch-900 dark:bg-white",
  Social: "bg-gold-500",
  Deadline: "bg-gold-500",
  Meeting: "bg-slate-400 dark:bg-white/50",
  Holiday: "bg-slate-400 dark:bg-white/50",
  Other: "bg-slate-400 dark:bg-white/50",
};

export function CalendarCategoryBadge({ category }: { category: CalendarEventCategory }) {
  return <Badge className={CALENDAR_CATEGORY_STYLES[category]}>{category}</Badge>;
}
