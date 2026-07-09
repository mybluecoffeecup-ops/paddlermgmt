"use client";

import { useState } from "react";
import { Plus, Trophy, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { DisciplineBadge } from "@/components/ui/Badge";
import { cn, todayIso } from "@/lib/utils";
import {
  ALL_COMPETITIVENESS_LEVELS,
  CREW_TAG_AGE_RANGE_OPTIONS,
  CREW_TAG_GENDER_OPTIONS,
  CREW_TAG_OTHER_OPTIONS,
  type CompetitivenessLevel,
  type Discipline,
  type Race,
} from "@/types";

const RACE_DISCIPLINE_OPTIONS: Discipline[] = ["DB", "OC"];

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

function formatRaceDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function CategoryChip({
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
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
        active
          ? "border-green-700/30 bg-green-500/10 text-green-700 shadow-soft dark:border-green-400/30 dark:text-green-300"
          : "border-slate-200/70 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-300"
      )}
    >
      {children}
    </button>
  );
}

function NewRaceForm({ onCreated }: { onCreated: (race: Race) => void }) {
  const { createRace, currentUserId } = useAppData();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [raceDate, setRaceDate] = useState(() => todayIso());
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [discipline, setDiscipline] = useState<Discipline>("DB");
  const [competitivenessLevel, setCompetitivenessLevel] = useState<CompetitivenessLevel>(
    ALL_COMPETITIVENESS_LEVELS[0]
  );
  const [raceCategories, setRaceCategories] = useState<Set<string>>(new Set());

  const canSubmit = name.trim() !== "" && raceDate !== "" && location.trim() !== "";

  function toggleCategory(tag: string) {
    setRaceCategories((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function handleCreate() {
    if (!canSubmit) return;
    const created = createRace({
      name: name.trim(),
      location: location.trim(),
      description: description.trim() === "" ? null : description.trim(),
      discipline,
      race_date: raceDate,
      registration_deadline: registrationDeadline.trim() === "" ? null : registrationDeadline,
      race_categories: Array.from(raceCategories),
      competitiveness_level: competitivenessLevel,
      created_by: currentUserId,
    });
    onCreated(created);
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto border-b border-slate-100 p-4 dark:border-white/10">
      <div>
        <label className={labelClassName}>Race name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClassName}
          placeholder="Summer Dragon Boat Regatta"
        />
      </div>

      <div>
        <label className={labelClassName}>Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClassName}
          placeholder="Lake Union"
        />
      </div>

      <div>
        <label className={labelClassName}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClassName}>Race date</label>
          <input
            type="date"
            value={raceDate}
            onChange={(e) => setRaceDate(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Registration deadline</label>
          <input
            type="date"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClassName}>Discipline</label>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as Discipline)}
            className={inputClassName}
          >
            {RACE_DISCIPLINE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName}>Competitiveness</label>
          <select
            value={competitivenessLevel}
            onChange={(e) => setCompetitivenessLevel(e.target.value as CompetitivenessLevel)}
            className={inputClassName}
          >
            {ALL_COMPETITIVENESS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className={labelClassName}>Race categories</label>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Gender
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CREW_TAG_GENDER_OPTIONS.map((tag) => (
              <CategoryChip
                key={tag}
                active={raceCategories.has(tag)}
                onClick={() => toggleCategory(tag)}
              >
                {tag}
              </CategoryChip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Age Range
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CREW_TAG_AGE_RANGE_OPTIONS.map((tag) => (
              <CategoryChip
                key={tag}
                active={raceCategories.has(tag)}
                onClick={() => toggleCategory(tag)}
              >
                {tag}
              </CategoryChip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Other
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CREW_TAG_OTHER_OPTIONS.map((tag) => (
              <CategoryChip
                key={tag}
                active={raceCategories.has(tag)}
                onClick={() => toggleCategory(tag)}
              >
                {tag}
              </CategoryChip>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        <Plus size={15} /> Create Race
      </button>
    </div>
  );
}

export function RaceManager() {
  const { races } = useAppData();
  const [isCreating, setIsCreating] = useState(false);

  const sorted = [...races].sort((a, b) => a.race_date.localeCompare(b.race_date));

  return (
    <Card>
      <CardHeader
        title="Race Management"
        subtitle={`${races.length} on the calendar`}
        icon={<Trophy size={16} />}
        action={
          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
          >
            {isCreating ? <X size={13} /> : <Plus size={13} />}
            {isCreating ? "Cancel" : "New Race"}
          </button>
        }
      />
      {isCreating ? (
        <NewRaceForm onCreated={() => setIsCreating(false)} />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <Trophy size={28} className="text-slate-300 dark:text-white/20" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No races on the calendar yet.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {sorted.map((race) => (
            <li
              key={race.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {race.name}
                </p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {formatRaceDate(race.race_date)} · {race.location}
                </p>
                {race.race_categories.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {race.race_categories.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <DisciplineBadge discipline={race.discipline} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {race.competitiveness_level}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
