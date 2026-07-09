"use client";

import { useDroppable } from "@dnd-kit/core";
import { Sparkles, Users2 } from "lucide-react";

import { PaddlerChip } from "@/components/lineup/PaddlerChip";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export const BENCH_DROPPABLE_ID = "bench";

export function BenchList({
  paddlers,
  onPaddlerClick,
}: {
  paddlers: Profile[];
  onPaddlerClick?: (paddler: Profile) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: BENCH_DROPPABLE_ID });

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader
        title="The Bench"
        subtitle={`${paddlers.length} attending, unseated`}
        icon={<Users2 size={16} />}
      />
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 overflow-y-auto p-3 transition-colors",
          isOver && "bg-green-50/60 dark:bg-green-500/5"
        )}
      >
        {paddlers.map((p) => (
          <PaddlerChip key={p.id} paddler={p} onClick={() => onPaddlerClick?.(p)} />
        ))}
        {paddlers.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
            <Sparkles size={24} className="text-green-500" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Everyone attending is seated.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
