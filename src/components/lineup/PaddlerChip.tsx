"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Mic2, Anchor, Compass } from "lucide-react";

import { cn, formatWeight } from "@/lib/utils";
import type { Profile } from "@/types";

const SIDE_BORDER: Record<string, string> = {
  Left: "border-l-rose-500",
  Right: "border-l-blue-500",
  Ambi: "border-l-violet-500",
};

const SIDE_DOT: Record<string, string> = {
  Left: "bg-rose-500",
  Right: "bg-blue-500",
  Ambi: "bg-violet-500",
};

export function PaddlerChip({
  paddler,
  compact = false,
  mismatch = false,
}: {
  paddler: Profile;
  compact?: boolean;
  mismatch?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: paddler.id,
    data: { paddler },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none select-none rounded-lg border border-slate-200 border-l-4 bg-white px-2.5 py-2 shadow-sm transition-shadow active:shadow-md dark:border-white/10 dark:bg-slate-800",
        SIDE_BORDER[paddler.preferred_side],
        isDragging && "opacity-40",
        mismatch && "ring-1 ring-amber-400",
        compact ? "cursor-grab" : "cursor-grab"
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
          {paddler.full_name}
        </p>
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SIDE_DOT[paddler.preferred_side])} />
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-1">
        <p className="text-[11px] font-semibold text-slate-400">{formatWeight(paddler.weight_kg)}</p>
        <div className="flex items-center gap-0.5 text-slate-400">
          {paddler.is_pacer && <Anchor size={10} />}
          {(paddler.is_oc_steer || paddler.is_db_steer) && <Compass size={10} />}
          {paddler.is_drummer && <Mic2 size={10} />}
        </div>
      </div>
    </div>
  );
}
