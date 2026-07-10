"use client";

import { Calendar, Flag, MapPin } from "lucide-react";
import Link from "next/link";

import { useAppData } from "@/hooks/app-data";
import { useCountdown } from "@/hooks/use-countdown";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/70 bg-white px-3 py-2 shadow-soft dark:border-white/10 dark:bg-pitch-900/70">
      <span
        className="font-display text-lg font-bold tabular-nums text-ink dark:text-white"
        suppressHydrationWarning
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
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
  const goingCount = raceCommitments.filter(
    (c) => c.race_id === race.id && c.status === "Going"
  ).length;
  const raceDateLabel = new Date(`${race.race_date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/races/${race.id}`}
          className="min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {race.name}
          </p>
          {race.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <MapPin size={11} /> {race.location}
            </p>
          )}
        </Link>
        {commitment && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              commitment.has_paid
                ? "bg-green-500/15 text-green-800 dark:bg-green-400/20 dark:text-white"
                : "bg-gold-500/20 text-gold-900 dark:bg-gold-400/25 dark:text-white"
            )}
          >
            {commitment.has_paid ? "Paid" : "Payment due"}
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Calendar size={11} /> {raceDateLabel}
      </p>

      <div className="mt-1.5 flex flex-wrap items-stretch gap-3">
        <div className="flex items-center gap-1.5">
          <CountdownUnit value={countdown.days} label="days" />
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border border-lime-400/40 bg-lime-400/20 px-3 py-2 shadow-soft dark:border-lime-400/30 dark:bg-lime-400/15">
          <span
            className="font-display text-lg font-bold tabular-nums text-ink dark:text-white"
            suppressHydrationWarning
          >
            {goingCount}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            going
          </span>
        </div>

        <div className="flex min-w-[8rem] flex-1 gap-1.5">
          {(["Going", "Maybe", "Not Going"] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateRaceCommitment(race.id, currentUserId, { status })}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center rounded-2xl border px-2 text-xs font-bold uppercase tracking-wide transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                commitment?.status === status
                  ? status === "Going"
                    ? "border-green-700 bg-green-700 text-white shadow-soft"
                    : status === "Not Going"
                      ? "border-redcard-700 bg-redcard-700 text-white shadow-soft"
                      : "border-ink bg-ink text-white shadow-soft dark:border-white dark:bg-white dark:text-ink"
                  : "border-slate-200/70 text-slate-600 dark:border-white/15 dark:text-slate-300"
              )}
            >
              {status}
            </button>
          ))}
        </div>
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
      <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
        {upcoming.map((race) => (
          <RaceRow key={race.id} race={race} />
        ))}
      </ul>
    </Card>
  );
}
