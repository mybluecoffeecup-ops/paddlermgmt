"use client";

import { useDroppable } from "@dnd-kit/core";
import { Users2 } from "lucide-react";

import { PaddlerChip } from "@/components/lineup/PaddlerChip";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export const BENCH_DROPPABLE_ID = "bench";

export function BenchList({ paddlers }: { paddlers: Profile[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: BENCH_DROPPABLE_ID });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
          <Users2 size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            The Bench
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {paddlers.length} attending, unseated
          </p>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 overflow-y-auto p-3 transition-colors",
          isOver && "bg-teal-50/60 dark:bg-teal-500/5"
        )}
      >
        {paddlers.map((p) => (
          <PaddlerChip key={p.id} paddler={p} />
        ))}
        {paddlers.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-slate-400">
            Everyone attending is seated.
          </p>
        )}
      </div>
    </div>
  );
}
