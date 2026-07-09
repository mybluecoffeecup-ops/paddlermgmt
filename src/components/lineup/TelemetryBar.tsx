"use client";

import { AlertTriangle, Scale } from "lucide-react";

import { getBalanceGroups, WEIGHT_IMBALANCE_WARNING_KG, type BoatLayout } from "@/lib/boat-config";
import { cn } from "@/lib/utils";
import type { Profile, SeatingConfiguration } from "@/types";

export function TelemetryBar({
  layout,
  seating,
  profileById,
}: {
  layout: BoatLayout;
  seating: SeatingConfiguration;
  profileById: Map<string, Profile>;
}) {
  const groups = getBalanceGroups(layout);

  const sumWeight = (seatIds: string[]) =>
    seatIds.reduce((sum, seatId) => {
      const paddlerId = seating[seatId];
      const profile = paddlerId ? profileById.get(paddlerId) : undefined;
      return sum + (profile?.weight_kg ?? 0);
    }, 0);

  const weightA = sumWeight(groups.seatIdsA);
  const weightB = sumWeight(groups.seatIdsB);
  const delta = Math.abs(weightA - weightB);
  const isImbalanced = delta > WEIGHT_IMBALANCE_WARNING_KG;

  const seatedCount = Object.values(seating).filter(Boolean).length;
  const totalSeats = layout.seats.filter((s) => !s.isCrewRole).length + (
    layout.seats.some((s) => s.isCrewRole) ? layout.seats.filter((s) => s.isCrewRole).length : 0
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-3xl border px-4 py-3 shadow-soft transition-colors",
        isImbalanced
          ? "border-gold-500/50 bg-gold-50 dark:border-gold-400/40 dark:bg-gold-500/10"
          : "border-slate-200/60 bg-white dark:border-white/10 dark:bg-pitch-900/70"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl",
            isImbalanced
              ? "bg-gold-500 text-ink"
              : "bg-green-500/15 text-green-700 dark:bg-green-400/20 dark:text-white"
          )}
        >
          {isImbalanced ? <AlertTriangle size={18} /> : <Scale size={18} />}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Live Balance
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {seatedCount} / {totalSeats} seats filled
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {groups.labelA}
          </p>
          <p className="font-display text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {weightA.toFixed(0)} kg
          </p>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {groups.labelB}
          </p>
          <p className="font-display text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {weightB.toFixed(0)} kg
          </p>
        </div>
        <div
          className={cn(
            "flex flex-col items-center rounded-2xl px-3 py-1.5",
            isImbalanced
              ? "bg-gold-500 text-ink"
              : "border border-slate-200/70 text-slate-700 dark:border-white/10 dark:text-slate-200"
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide">Delta</span>
          <span className="font-display text-xl font-bold tabular-nums">{delta.toFixed(1)} kg</span>
        </div>
      </div>

      {isImbalanced && (
        <p className="flex w-full items-center gap-1.5 text-xs font-semibold text-gold-900 dark:text-gold-300">
          <AlertTriangle size={13} className="shrink-0" />
          Structural imbalance exceeds {WEIGHT_IMBALANCE_WARNING_KG} kg — rebalance {groups.labelA}/{groups.labelB} before racing.
        </p>
      )}
    </div>
  );
}
