"use client";

import { useState } from "react";
import { Pencil, Check, Anchor, Mic2, Compass } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatWeight } from "@/lib/utils";

const SIDE_DOT: Record<string, string> = {
  Left: "bg-rose-500",
  Right: "bg-blue-500",
  Ambi: "bg-violet-500",
};

const SIDE_CYCLE = ["Left", "Right", "Ambi"] as const;

export function ProfileSummaryCard() {
  const { currentUser, updateProfile, attendance, currentUserId } = useAppData();
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  if (!currentUser) return null;

  const showPreferredSide =
    currentUser.primary_discipline === "DB" || currentUser.primary_discipline === "Both";

  function cyclePreferredSide() {
    const idx = SIDE_CYCLE.indexOf(currentUser!.preferred_side);
    const next = SIDE_CYCLE[(idx + 1) % SIDE_CYCLE.length];
    updateProfile(currentUserId, { preferred_side: next });
  }

  const upcomingAttending = attendance.filter(
    (a) => a.paddler_id === currentUserId && a.status === "Going"
  ).length;
  const upcomingUnconfirmed = attendance.filter(
    (a) => a.paddler_id === currentUserId && a.status === "Maybe"
  ).length;

  function startEdit() {
    setWeightInput(currentUser!.weight_kg?.toString() ?? "");
    setEditingWeight(true);
  }

  function saveWeight() {
    const val = parseFloat(weightInput);
    if (!Number.isNaN(val)) {
      updateProfile(currentUserId, { weight_kg: val });
    }
    setEditingWeight(false);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 bg-pitch-900 px-4 py-5 text-white">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-lg font-bold text-ink shadow-[0_0_20px_rgba(253,189,28,0.35)]">
          {currentUser.full_name
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{currentUser.full_name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge className="bg-white/15 text-white">{currentUser.primary_discipline}</Badge>
            {showPreferredSide && (
              <button
                onClick={cyclePreferredSide}
                aria-label="Cycle preferred side"
                className="inline-flex"
              >
                <Badge className="bg-white/15 text-white">
                  <span className={`h-1.5 w-1.5 rounded-full ${SIDE_DOT[currentUser.preferred_side]}`} />
                  {currentUser.preferred_side}
                  <Pencil size={9} className="text-white/60" />
                </Badge>
              </button>
            )}
            {currentUser.is_pacer && (
              <Badge className="bg-white/15 text-white">
                <Anchor size={11} /> Pacer
              </Badge>
            )}
            {currentUser.is_oc_steer && (
              <Badge className="bg-white/15 text-white">
                <Compass size={11} /> OC Steer
              </Badge>
            )}
            {currentUser.is_db_steer && (
              <Badge className="bg-white/15 text-white">
                <Compass size={11} /> DB Steer
              </Badge>
            )}
            {currentUser.is_drummer && (
              <Badge className="bg-white/15 text-white">
                <Mic2 size={11} /> Drummer
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10">
        <div className="flex flex-col items-center justify-center gap-1 px-2 py-4">
          {editingWeight ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                inputMode="decimal"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveWeight()}
                className="w-16 rounded-xl border border-slate-200/70 bg-white px-1.5 py-1 text-center text-lg font-bold text-ink focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
              />
              <button
                onClick={saveWeight}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white shadow-soft transition-all active:scale-95"
                aria-label="Save weight"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1 font-display text-xl font-bold tabular-nums text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-white"
            >
              {formatWeight(currentUser.weight_kg)}
              <Pencil size={11} className="text-slate-500" />
            </button>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Weight
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2 py-4">
          <span className="font-display text-xl font-bold tabular-nums text-green-700 dark:text-green-400">
            {upcomingAttending}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Going
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2 py-4">
          <span className="font-display text-xl font-bold tabular-nums text-ink dark:text-white">
            {upcomingUnconfirmed}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Needs RSVP
          </span>
        </div>
      </div>
    </Card>
  );
}
