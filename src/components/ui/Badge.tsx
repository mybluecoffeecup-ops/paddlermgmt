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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  Attending: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  Unconfirmed: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  Waitlist: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{status}</Badge>;
}

const DISCIPLINE_STYLES: Record<Discipline, string> = {
  DB: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300",
  OC: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
  Both: "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300",
};

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  return <Badge className={DISCIPLINE_STYLES[discipline]}>{discipline}</Badge>;
}
