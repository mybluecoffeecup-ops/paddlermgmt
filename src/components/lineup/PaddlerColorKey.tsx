"use client";

import { Anchor, Compass, Mic2 } from "lucide-react";

import { PADDLE_SIDE_COLORS } from "@/lib/paddle-side-colors";
import { cn } from "@/lib/utils";

const SIDE_ORDER: (keyof typeof PADDLE_SIDE_COLORS)[] = ["Left", "Right", "Ambi"];

export function PaddlerColorKey() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-3xl border border-slate-200/60 bg-white px-4 py-2 shadow-soft dark:border-white/10 dark:bg-pitch-900/70">
      {SIDE_ORDER.map((side) => (
        <div key={side} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PADDLE_SIDE_COLORS[side].dot)} />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {PADDLE_SIDE_COLORS[side].label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-gold-500 bg-white dark:bg-pitch-900" />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          Side mismatch
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Anchor size={12} className="text-slate-600 dark:text-slate-300" />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Pacer</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Compass size={12} className="text-slate-600 dark:text-slate-300" />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Steer</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Mic2 size={12} className="text-slate-600 dark:text-slate-300" />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Drummer</span>
      </div>
    </div>
  );
}
