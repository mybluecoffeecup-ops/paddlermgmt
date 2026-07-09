"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Mic2, Anchor, Compass } from "lucide-react";

import { cn, formatWeight } from "@/lib/utils";
import { PADDLE_SIDE_COLORS } from "@/lib/paddle-side-colors";
import type { Profile } from "@/types";

export function PaddlerChip({
  paddler,
  compact = false,
  mismatch = false,
  onClick,
}: {
  paddler: Profile;
  compact?: boolean;
  mismatch?: boolean;
  onClick?: () => void;
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
      onClick={onClick}
      className={cn(
        "touch-none select-none rounded-2xl border border-slate-200/70 border-l-4 bg-white px-2.5 py-2 shadow-soft transition-all active:scale-[1.02] active:shadow-soft-lg dark:border-white/10 dark:bg-pitch-900/70",
        PADDLE_SIDE_COLORS[paddler.preferred_side].border,
        isDragging && "opacity-40",
        mismatch && "ring-2 ring-gold-500",
        compact ? "cursor-grab" : "cursor-grab"
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
          {paddler.full_name}
        </p>
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            PADDLE_SIDE_COLORS[paddler.preferred_side].dot
          )}
        />
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-1">
        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {formatWeight(paddler.weight_kg)}
        </p>
        <div className="flex items-center gap-0.5 text-slate-600 dark:text-slate-300">
          {paddler.is_pacer && <Anchor size={10} />}
          {(paddler.is_oc_steer || paddler.is_db_steer) && <Compass size={10} />}
          {paddler.is_drummer && <Mic2 size={10} />}
        </div>
      </div>
    </div>
  );
}
