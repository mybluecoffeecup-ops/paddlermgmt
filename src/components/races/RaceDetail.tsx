"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Pencil, Trophy, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { DisciplineBadge } from "@/components/ui/Badge";
import { CommentsSection } from "@/components/shared/CommentsSection";
import { LineupsSection } from "@/components/shared/LineupsSection";
import { cn } from "@/lib/utils";
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

function EditForm({ race, onDone }: { race: Race; onDone: () => void }) {
  const { updateRace, notifyAll } = useAppData();

  const [name, setName] = useState(race.name);
  const [location, setLocation] = useState(race.location ?? "");
  const [description, setDescription] = useState(race.description ?? "");
  const [raceDate, setRaceDate] = useState(race.race_date);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    race.registration_deadline ?? ""
  );
  const [discipline, setDiscipline] = useState<Discipline>(race.discipline);
  const [competitivenessLevel, setCompetitivenessLevel] = useState<CompetitivenessLevel>(
    race.competitiveness_level
  );
  const [raceCategories, setRaceCategories] = useState<Set<string>>(
    new Set(race.race_categories)
  );

  const canSave = name.trim() !== "" && raceDate !== "" && location.trim() !== "";

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

  function handleSave() {
    if (!canSave) return;
    updateRace(race.id, {
      name: name.trim(),
      location: location.trim(),
      description: description.trim() === "" ? null : description.trim(),
      discipline,
      race_date: raceDate,
      registration_deadline: registrationDeadline.trim() === "" ? null : registrationDeadline,
      race_categories: Array.from(raceCategories),
      competitiveness_level: competitivenessLevel,
    });
    notifyAll("Race updated", `${name.trim()} was updated by a coach.`, { raceId: race.id });
    onDone();
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <label className={labelClassName}>Race name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />
      </div>
      <div>
        <label className={labelClassName}>Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClassName}
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
        onClick={handleSave}
        disabled={!canSave}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        Save & Notify Crew
      </button>
    </div>
  );
}

export function RaceDetail({ raceId }: { raceId: string }) {
  const { races, role } = useAppData();
  const [isEditing, setIsEditing] = useState(false);

  const race = races.find((r) => r.id === raceId);

  if (!race) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
        Race not found.{" "}
        <Link href="/" className="font-bold text-green-700 dark:text-green-400">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 text-slate-700 shadow-soft transition-all hover:bg-slate-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            {race.name}
          </h1>
        </div>
        {role === "coach" && (
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
          >
            {isEditing ? <X size={13} /> : <Pencil size={13} />}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      <Card>
        <CardHeader title="Details" icon={<Trophy size={16} />} />
        {isEditing ? (
          <EditForm race={race} onDone={() => setIsEditing(false)} />
        ) : (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <DisciplineBadge discipline={race.discipline} />
              <span className="rounded-full border border-slate-200/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-300">
                {race.competitiveness_level}
              </span>
            </div>
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Calendar size={14} className="text-slate-400" />
              {formatRaceDate(race.race_date)}
              {race.registration_deadline &&
                ` · Registration by ${formatRaceDate(race.registration_deadline)}`}
            </p>
            {race.location && (
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <MapPin size={14} className="text-slate-400" />
                {race.location}
              </p>
            )}
            {race.race_categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
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
            {race.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{race.description}</p>
            )}
          </div>
        )}
      </Card>

      <LineupsSection raceId={race.id} defaultTitle={race.name} />
      <CommentsSection raceId={race.id} />
    </div>
  );
}
