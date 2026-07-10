"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CREW_TAG_AGE_RANGE_OPTIONS,
  CREW_TAG_GENDER_OPTIONS,
  CREW_TAG_OTHER_OPTIONS,
  type Discipline,
} from "@/types";

export const DISCIPLINE_OPTIONS: Discipline[] = ["DB", "OC", "Both"];

interface FilterSidebarProps {
  disciplines: Set<Discipline>;
  onToggleDiscipline: (d: Discipline) => void;
  crewTags: Set<string>;
  onToggleCrewTag: (tag: string) => void;
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded border px-2.5 py-1.5 text-left text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
        active
          ? "border-green-700/30 bg-green-500/10 text-green-700 shadow-soft dark:border-green-400/30 dark:text-green-300"
          : "border-slate-200/70 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-300"
      )}
    >
      {children}
    </button>
  );
}

export function FilterSidebar({
  disciplines,
  onToggleDiscipline,
  crewTags,
  onToggleCrewTag,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = disciplines.size + crewTags.size;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 rounded-3xl border border-slate-200/60 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-pitch-900/70 xl:w-60 xl:gap-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={13} />
          Segment Roster
          {activeCount > 0 && (
            <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-300">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn("transition-transform xl:hidden", isOpen && "rotate-180")}
        />
      </button>

      <div className={cn("flex-col gap-3 xl:flex", isOpen ? "flex" : "hidden")}>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Discipline
          </p>
          <div className="grid grid-cols-3 gap-1 xl:grid-cols-1">
            {DISCIPLINE_OPTIONS.map((d) => (
              <ToggleChip
                key={d}
                active={disciplines.has(d)}
                onClick={() => onToggleDiscipline(d)}
              >
                {d}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Gender
          </p>
          <div className="grid grid-cols-3 gap-1 xl:grid-cols-1">
            {CREW_TAG_GENDER_OPTIONS.map((tag) => (
              <ToggleChip key={tag} active={crewTags.has(tag)} onClick={() => onToggleCrewTag(tag)}>
                {tag}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Age Range
          </p>
          <div className="grid grid-cols-2 gap-1 xl:grid-cols-1">
            {CREW_TAG_AGE_RANGE_OPTIONS.map((tag) => (
              <ToggleChip key={tag} active={crewTags.has(tag)} onClick={() => onToggleCrewTag(tag)}>
                {tag}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Other
          </p>
          <div className="grid grid-cols-2 gap-1 xl:grid-cols-1">
            {CREW_TAG_OTHER_OPTIONS.map((tag) => (
              <ToggleChip key={tag} active={crewTags.has(tag)} onClick={() => onToggleCrewTag(tag)}>
                {tag}
              </ToggleChip>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
