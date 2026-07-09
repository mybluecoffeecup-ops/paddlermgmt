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
        "w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        active
          ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300"
          : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:text-slate-400"
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
    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 xl:w-60 xl:gap-5">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={13} />
          Segment Roster
          {activeCount > 0 && (
            <span className="rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn("transition-transform xl:hidden", isOpen && "rotate-180")}
        />
      </button>

      <div className={cn("flex-col gap-5 xl:flex", isOpen ? "flex" : "hidden")}>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Discipline
          </p>
          <div className="grid grid-cols-3 gap-1.5 xl:grid-cols-1">
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
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Gender
          </p>
          <div className="grid grid-cols-3 gap-1.5 xl:grid-cols-1">
            {CREW_TAG_GENDER_OPTIONS.map((tag) => (
              <ToggleChip key={tag} active={crewTags.has(tag)} onClick={() => onToggleCrewTag(tag)}>
                {tag}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Age Range
          </p>
          <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-1">
            {CREW_TAG_AGE_RANGE_OPTIONS.map((tag) => (
              <ToggleChip key={tag} active={crewTags.has(tag)} onClick={() => onToggleCrewTag(tag)}>
                {tag}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Other
          </p>
          <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-1">
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
