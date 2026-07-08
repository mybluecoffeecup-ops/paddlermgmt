"use client";

import { Flag, MapPin } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { useCountdown } from "@/hooks/use-countdown";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-900/5 px-2 py-1.5 dark:bg-white/10">
      <span
        className="font-display text-lg font-bold tabular-nums text-slate-900 dark:text-white"
        suppressHydrationWarning
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
  );
}

function RaceRow({ race }: { race: import("@/types").Race }) {
  const countdown = useCountdown(race.race_date);
  const { raceCommitments, currentUserId, updateRaceCommitment } = useAppData();
  const commitment = raceCommitments.find(
    (c) => c.race_id === race.id && c.paddler_id === currentUserId
  );

  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {race.name}
          </p>
          {race.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin size={11} /> {race.location}
            </p>
          )}
        </div>
        {commitment && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
              commitment.has_paid
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
            )}
          >
            {commitment.has_paid ? "Paid" : "Payment due"}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <CountdownUnit value={countdown.days} label="days" />
        <CountdownUnit value={countdown.hours} label="hrs" />
        <CountdownUnit value={countdown.minutes} label="min" />
        <CountdownUnit value={countdown.seconds} label="sec" />
      </div>

      <div className="mt-3 flex gap-1.5">
        {(["Attending", "Unconfirmed", "Absent"] as const).map((status) => (
          <button
            key={status}
            onClick={() => updateRaceCommitment(race.id, currentUserId, { status })}
            className={cn(
              "flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
              commitment?.status === status
                ? status === "Attending"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : status === "Absent"
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-slate-400 bg-slate-400 text-white"
                : "border-slate-200 text-slate-500 dark:border-white/15 dark:text-slate-400"
            )}
          >
            {status}
          </button>
        ))}
      </div>
    </li>
  );
}

export function RaceCountdowns() {
  const { races } = useAppData();
  const upcoming = [...races].sort((a, b) => a.race_date.localeCompare(b.race_date));

  return (
    <Card>
      <CardHeader title="Race Tracking" subtitle={`${upcoming.length} upcoming`} icon={<Flag size={16} />} />
      <ul className="divide-y divide-slate-100 dark:divide-white/10">
        {upcoming.map((race) => (
          <RaceRow key={race.id} race={race} />
        ))}
      </ul>
    </Card>
  );
}
