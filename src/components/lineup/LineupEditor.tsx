"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useAppData } from "@/hooks/app-data";
import { getBoatLayout } from "@/lib/boat-config";
import { autoAssignSeat } from "@/lib/auto-assign-seat";
import { cn } from "@/lib/utils";
import { BenchList, BENCH_DROPPABLE_ID } from "@/components/lineup/BenchList";
import { BoatCanvas } from "@/components/lineup/BoatCanvas";
import { TelemetryBar } from "@/components/lineup/TelemetryBar";
import { PaddlerChip } from "@/components/lineup/PaddlerChip";
import { PaddlerColorKey } from "@/components/lineup/PaddlerColorKey";
import type { BoatType, Profile, SeatingConfiguration } from "@/types";

const BOAT_TOGGLE_OPTIONS: { value: BoatType; label: string }[] = [
  { value: "DB12", label: "DB12" },
  { value: "DB22", label: "DB22" },
  { value: "V6", label: "V6" },
];

export function LineupEditor({ lineupId }: { lineupId: string }) {
  const {
    lineups,
    sessions,
    races,
    raceCommitments,
    profiles,
    attendanceFor,
    saveLineupSeating,
    updateLineupBoat,
  } = useAppData();
  const [activePaddler, setActivePaddler] = useState<Profile | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const lineup = lineups.find((l) => l.id === lineupId);
  const session = sessions.find((s) => s.id === lineup?.session_id);
  const race = races.find((r) => r.id === lineup?.race_id);
  const target = session ?? race;

  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const attendingProfiles = useMemo(() => {
    if (session) {
      const ids = attendanceFor(session.id)
        .filter((a) => a.status === "Going")
        .map((a) => a.paddler_id);
      return ids.map((id) => profileById.get(id)).filter((p): p is Profile => Boolean(p));
    }
    if (race) {
      const ids = raceCommitments
        .filter((c) => c.race_id === race.id && c.status === "Going")
        .map((c) => c.paddler_id);
      return ids.map((id) => profileById.get(id)).filter((p): p is Profile => Boolean(p));
    }
    return [];
  }, [session, race, attendanceFor, raceCommitments, profileById]);

  if (!lineup || !target) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
        Lineup not found.{" "}
        <Link href="/lineups" className="font-bold text-green-700 dark:text-green-400">
          Back to lineups
        </Link>
      </div>
    );
  }

  const layout = getBoatLayout(lineup.boat);
  const seating: SeatingConfiguration = lineup.seating_configuration;

  const seatedIds = new Set(Object.values(seating).filter((v): v is string => Boolean(v)));
  const benchPaddlers = attendingProfiles.filter((p) => !seatedIds.has(p.id));

  function handleDragStart(event: DragStartEvent) {
    const paddler = event.active.data.current?.paddler as Profile | undefined;
    setActivePaddler(paddler ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActivePaddler(null);
    const { active, over } = event;
    if (!over || !lineup) return;

    const paddlerId = String(active.id);
    const targetId = String(over.id);
    const prevSeatId = Object.keys(seating).find((k) => seating[k] === paddlerId);

    if (targetId === BENCH_DROPPABLE_ID) {
      if (!prevSeatId) return;
      saveLineupSeating(lineup.id, { ...seating, [prevSeatId]: null });
      return;
    }

    if (prevSeatId === targetId) return;

    const occupant = seating[targetId] ?? null;
    const next: SeatingConfiguration = { ...seating, [targetId]: paddlerId };
    if (prevSeatId) {
      next[prevSeatId] = occupant && occupant !== paddlerId ? occupant : null;
    }
    saveLineupSeating(lineup.id, next);
  }

  function handleBenchClick(paddler: Profile) {
    if (!lineup) return;
    const seatId = autoAssignSeat(paddler, layout, seating);
    if (!seatId) return;
    saveLineupSeating(lineup.id, { ...seating, [seatId]: paddler.id });
  }

  function handleBoatChange(nextBoat: BoatType) {
    if (!lineup || nextBoat === lineup.boat) return;
    const validSeatIds = new Set(getBoatLayout(nextBoat).seats.map((s) => s.id));
    const droppedCount = Object.entries(seating).filter(
      ([seatId, paddlerId]) => paddlerId && !validSeatIds.has(seatId)
    ).length;
    if (droppedCount > 0) {
      const confirmed = window.confirm(
        `Switching boats will move ${droppedCount} paddler${droppedCount === 1 ? "" : "s"} back to the bench — their seats don't exist in the new layout. Continue?`
      );
      if (!confirmed) return;
    }
    updateLineupBoat(lineup.id, nextBoat);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActivePaddler(null)}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/lineups"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 text-slate-700 shadow-soft transition-all hover:bg-slate-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <ArrowLeft size={15} />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                {lineup.title}
              </h1>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {session ? session.title : race!.name} · {layout.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-slate-200/70 p-1 dark:border-white/10">
            {BOAT_TOGGLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleBoatChange(opt.value)}
                className={cn(
                  "min-h-9 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  opt.value === lineup.boat
                    ? "bg-green-700 text-white shadow-soft"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <TelemetryBar layout={layout} seating={seating} profileById={profileById} />
        <PaddlerColorKey />

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[16rem_1fr] md:items-start">
          <div className="md:h-[65vh]">
            <BenchList paddlers={benchPaddlers} onPaddlerClick={handleBenchClick} />
          </div>
          <div className="md:h-[65vh]">
            <BoatCanvas layout={layout} seating={seating} profileById={profileById} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activePaddler ? <PaddlerChip paddler={activePaddler} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
