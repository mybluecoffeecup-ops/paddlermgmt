"use client";

import { useDroppable } from "@dnd-kit/core";
import { Mic2, Compass } from "lucide-react";

import { PaddlerChip } from "@/components/lineup/PaddlerChip";
import { cn } from "@/lib/utils";
import type { SeatDefinition } from "@/lib/boat-config";
import type { Profile } from "@/types";

export function SeatSlot({
  seat,
  occupant,
  onOccupantClick,
}: {
  seat: SeatDefinition;
  occupant: Profile | null;
  onOccupantClick?: (paddler: Profile) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: seat.id, data: { seat } });

  const mismatch =
    !!occupant &&
    !seat.isCrewRole &&
    occupant.preferred_side !== "Ambi" &&
    seat.side !== "Single" &&
    occupant.preferred_side !== seat.side;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[64px] flex-col justify-center rounded-2xl border-2 border-dashed p-1 transition-colors",
        seat.isCrewRole
          ? "border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-white/[0.03]"
          : "border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02]",
        isOver && "border-green-700 bg-green-50 dark:bg-green-500/10"
      )}
    >
      {occupant ? (
        <PaddlerChip
          paddler={occupant}
          compact
          mismatch={mismatch}
          onClick={() => onOccupantClick?.(occupant)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-0.5 py-1.5 text-slate-500 dark:text-white/50">
          {seat.id === "drummer" && <Mic2 size={14} />}
          {seat.id === "steer" && <Compass size={14} />}
          <span className="text-[10px] font-bold uppercase tracking-wide">{seat.label}</span>
        </div>
      )}
    </div>
  );
}
