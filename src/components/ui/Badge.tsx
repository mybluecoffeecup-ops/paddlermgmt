import { cn } from "@/lib/utils";
import type { AttendanceStatus, Discipline } from "@/types";

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
  Attending: "bg-green-500/15 text-green-800 dark:bg-green-400/20 dark:text-white",
  Unconfirmed: "border border-slate-300 text-slate-700 dark:border-white/30 dark:text-white",
  Absent: "bg-redcard-500/15 text-redcard-700 dark:bg-redcard-500/25 dark:text-white",
  Waitlist: "bg-gold-500/20 text-gold-900 dark:bg-gold-400/25 dark:text-white",
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
