"use client";

import { Users, Scale, TrendingUp, Ship } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import type { Profile, Session } from "@/types";
import { cn } from "@/lib/utils";

function MetricCard({
  icon,
  label,
  value,
  hint,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-3xl border border-slate-200/60 bg-white px-4 py-3 shadow-soft dark:border-white/10 dark:bg-pitch-900/70">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          warn
            ? "bg-gold-500/20 text-gold-800 dark:bg-gold-400/25 dark:text-white"
            : "bg-green-500/15 text-green-700 dark:bg-green-400/20 dark:text-white"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-tight tabular-nums text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {label}
        </p>
        {hint && <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{hint}</p>}
      </div>
    </div>
  );
}

export function MetricsSummary({
  session,
  rosterProfiles,
}: {
  session: Session | undefined;
  rosterProfiles: Profile[];
}) {
  const { attendanceFor } = useAppData();

  if (!session) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
        Select a session to see metrics.
      </div>
    );
  }

  const rosterIds = new Set(rosterProfiles.map((p) => p.id));
  const sessionAttendance = attendanceFor(session.id).filter((a) => rosterIds.has(a.paddler_id));
  const attending = sessionAttendance.filter((a) => a.status === "Attending");
  const responded = sessionAttendance.filter((a) => a.status !== "Unconfirmed");

  const totalWeight = attending.reduce((sum, a) => {
    const profile = rosterProfiles.find((p) => p.id === a.paddler_id);
    return sum + (profile?.weight_kg ?? 0);
  }, 0);

  const capacity = session.capacity_limit ?? 0;
  const overCapacity = capacity > 0 && attending.length > capacity;
  const attendancePct = rosterProfiles.length
    ? Math.round((responded.length / rosterProfiles.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard
        icon={<Users size={18} />}
        label="Headcount"
        value={capacity ? `${attending.length} / ${capacity}` : `${attending.length}`}
        hint={overCapacity ? "Over boat capacity" : "vs. boat capacity"}
        warn={overCapacity}
      />
      <MetricCard
        icon={<Scale size={18} />}
        label="Total Weight"
        value={`${totalWeight.toFixed(0)} kg`}
        hint="attending paddlers"
      />
      <MetricCard
        icon={<TrendingUp size={18} />}
        label="Response Rate"
        value={`${attendancePct}%`}
        hint={`${responded.length} of ${rosterProfiles.length} replied`}
      />
      <MetricCard
        icon={<Ship size={18} />}
        label="Discipline"
        value={session.discipline}
        hint={session.type}
      />
    </div>
  );
}
