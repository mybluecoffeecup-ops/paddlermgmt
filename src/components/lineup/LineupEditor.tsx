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
import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppData } from "@/hooks/app-data";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { getBoatLayout } from "@/lib/boat-config";
import { autoAssignSeat } from "@/lib/auto-assign-seat";
import { autoFillLineup } from "@/lib/auto-lineup";
import { cn, shallowEqualSeating } from "@/lib/utils";
import { BenchList, BENCH_DROPPABLE_ID } from "@/components/lineup/BenchList";
import { BoatCanvas } from "@/components/lineup/BoatCanvas";
import { TelemetryBar } from "@/components/lineup/TelemetryBar";
import { PaddlerChip } from "@/components/lineup/PaddlerChip";
import { PaddlerColorKey } from "@/components/lineup/PaddlerColorKey";
import { Dialog } from "@/components/ui/Dialog";
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
  const router = useRouter();
  const [activePaddler, setActivePaddler] = useState<Profile | null>(null);
  const [draftSeating, setDraftSeating] = useState<SeatingConfiguration | null>(null);
  const [draftBoat, setDraftBoat] = useState<BoatType | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const lineup = lineups.find((l) => l.id === lineupId);
  const session = sessions.find((s) => s.id === lineup?.session_id);
  const race = races.find((r) => r.id === lineup?.race_id);
  const target = session ?? race;

  // Seed the draft from the loaded lineup exactly once (guarded by the
  // `=== null` check so it never re-fires on subsequent renders). This is
  // React's "adjust state during render" pattern rather than an effect,
  // since `lineup` can resolve asynchronously after mount.
  if (lineup && draftSeating === null) setDraftSeating(lineup.seating_configuration);
  if (lineup && draftBoat === null) setDraftBoat(lineup.boat);

  const isDirty = Boolean(
    lineup &&
      draftSeating !== null &&
      draftBoat !== null &&
      (draftBoat !== lineup.boat || !shallowEqualSeating(draftSeating, lineup.seating_configuration))
  );

  useUnsavedChangesGuard(isDirty, setPendingHref);

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

  const boat: BoatType = draftBoat ?? lineup.boat;
  const layout = getBoatLayout(boat);
  const seating: SeatingConfiguration = draftSeating ?? lineup.seating_configuration;

  const seatedIds = new Set(Object.values(seating).filter((v): v is string => Boolean(v)));
  const benchPaddlers = attendingProfiles.filter((p) => !seatedIds.has(p.id));

  function handleDragStart(event: DragStartEvent) {
    const paddler = event.active.data.current?.paddler as Profile | undefined;
    setActivePaddler(paddler ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActivePaddler(null);
    const { active, over } = event;
    if (!over) return;

    const paddlerId = String(active.id);
    const targetId = String(over.id);
    const prevSeatId = Object.keys(seating).find((k) => seating[k] === paddlerId);

    if (targetId === BENCH_DROPPABLE_ID) {
      if (!prevSeatId) return;
      setDraftSeating({ ...seating, [prevSeatId]: null });
      return;
    }

    if (prevSeatId === targetId) return;

    const occupant = seating[targetId] ?? null;
    const next: SeatingConfiguration = { ...seating, [targetId]: paddlerId };
    if (prevSeatId) {
      next[prevSeatId] = occupant && occupant !== paddlerId ? occupant : null;
    }
    setDraftSeating(next);
  }

  function handleBenchClick(paddler: Profile) {
    const seatId = autoAssignSeat(paddler, layout, seating);
    if (!seatId) return;
    setDraftSeating({ ...seating, [seatId]: paddler.id });
  }

  function handleAutoFill() {
    if (benchPaddlers.length === 0) return;
    setDraftSeating(autoFillLineup(benchPaddlers, layout, seating, profileById));
  }

  function handleBoatChange(nextBoat: BoatType) {
    if (nextBoat === boat) return;
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
    const prunedSeating: SeatingConfiguration = Object.fromEntries(
      Object.entries(seating).filter(([seatId]) => validSeatIds.has(seatId))
    );
    setDraftBoat(nextBoat);
    setDraftSeating(prunedSeating);
  }

  function handleSave() {
    if (!lineup || !isDirty) return;
    if (draftBoat !== null && draftBoat !== lineup.boat) {
      updateLineupBoat(lineup.id, draftBoat);
    }
    const targetBoat = draftBoat ?? lineup.boat;
    const validSeatIds = new Set(getBoatLayout(targetBoat).seats.map((s) => s.id));
    const finalSeating: SeatingConfiguration = Object.fromEntries(
      Object.entries(draftSeating ?? {}).filter(([seatId]) => validSeatIds.has(seatId))
    );
    saveLineupSeating(lineup.id, finalSeating);
    setDraftSeating(null);
    setDraftBoat(null);
  }

  function handleDiscard() {
    setDraftSeating(null);
    setDraftBoat(null);
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-slate-200/70 p-1 dark:border-white/10">
              {BOAT_TOGGLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleBoatChange(opt.value)}
                  className={cn(
                    "min-h-9 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                    opt.value === boat
                      ? "bg-green-700 text-white shadow-soft"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              disabled={benchPaddlers.length === 0}
              className="flex min-h-9 items-center gap-1.5 rounded border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:border-green-700 hover:bg-green-700 hover:text-white disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/40 dark:text-white"
            >
              <Wand2 size={14} />
              Auto-fill
            </button>

            {isDirty && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="min-h-9 rounded border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/40 dark:text-white"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-9 rounded bg-green-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  Save
                </button>
              </div>
            )}
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

      <Dialog
        open={pendingHref !== null}
        title="Unsaved changes"
        description="You have unsaved lineup changes. Save before leaving, or discard them?"
        onOpenChange={(open) => {
          if (!open) setPendingHref(null);
        }}
        actions={[
          { label: "Cancel", variant: "ghost", autoFocus: true, onClick: () => setPendingHref(null) },
          {
            label: "Discard",
            variant: "caution",
            onClick: () => {
              const href = pendingHref!;
              setPendingHref(null);
              router.push(href);
            },
          },
          {
            label: "Save",
            variant: "primary",
            onClick: () => {
              handleSave();
              const href = pendingHref!;
              setPendingHref(null);
              router.push(href);
            },
          },
        ]}
      />
    </DndContext>
  );
}
