"use client";

import { useState } from "react";
import { Anchor, Compass, Mic2, Save, User } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  ALL_AGE_RANGES,
  ALL_ELIGIBILITY_STATUSES,
  CREW_TAG_AGE_RANGE_OPTIONS,
  CREW_TAG_GENDER_OPTIONS,
  CREW_TAG_OTHER_OPTIONS,
  type AgeRange,
  type Discipline,
  type EligibilityStatus,
  type PaddleSide,
  type Profile,
} from "@/types";

const DISCIPLINE_OPTIONS: Discipline[] = ["DB", "OC", "Both"];
const SIDE_OPTIONS: PaddleSide[] = ["Left", "Right", "Ambi"];

interface ProfileDraft {
  full_name: string;
  weight_kg: string;
  primary_discipline: Discipline;
  preferred_side: PaddleSide;
  eligibility: EligibilityStatus;
  age_range: AgeRange | null;
  is_pacer: boolean;
  is_oc_steer: boolean;
  is_db_steer: boolean;
  is_drummer: boolean;
  crew_tags: string[];
}

function toDraft(p: Profile): ProfileDraft {
  return {
    full_name: p.full_name,
    weight_kg: p.weight_kg?.toString() ?? "",
    primary_discipline: p.primary_discipline,
    preferred_side: p.preferred_side,
    eligibility: p.eligibility,
    age_range: p.age_range,
    is_pacer: p.is_pacer,
    is_oc_steer: p.is_oc_steer,
    is_db_steer: p.is_db_steer,
    is_drummer: p.is_drummer,
    crew_tags: p.crew_tags,
  };
}

function Chip({
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
        "flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
        active
          ? "border-green-700/30 bg-green-500/10 text-green-700 shadow-soft dark:border-green-400/30 dark:text-green-300"
          : "border-slate-200/70 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-300"
      )}
    >
      {children}
    </button>
  );
}

const selectClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const inputClassName = selectClassName;
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

export default function ProfilePage() {
  const { currentUser, currentUserId, updateProfile, loading } = useAppData();
  // `draftOverride` starts null and is only ever set by the user's own edits;
  // until then, `draft` is derived straight from `currentUser` each render
  // (no effect needed) so it naturally picks up the profile once it loads,
  // and never gets clobbered by that load once the user starts typing.
  const [draftOverride, setDraftOverride] = useState<ProfileDraft | null>(null);
  const [saved, setSaved] = useState(false);

  const draft = draftOverride ?? (currentUser ? toDraft(currentUser) : null);

  if (loading || !draft) {
    return (
      <p className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Loading profile…</p>
    );
  }

  const showPreferredSide =
    draft.primary_discipline === "DB" || draft.primary_discipline === "Both";

  const update = (patch: Partial<ProfileDraft>) => {
    setDraftOverride({ ...draft, ...patch });
  };

  const toggleCrewTag = (tag: string) => {
    setDraftOverride({
      ...draft,
      crew_tags: draft.crew_tags.includes(tag)
        ? draft.crew_tags.filter((t) => t !== tag)
        : [...draft.crew_tags, tag],
    });
  };

  const handleSave = () => {
    updateProfile(currentUserId, {
      full_name: draft.full_name.trim(),
      weight_kg: draft.weight_kg.trim() === "" ? null : parseFloat(draft.weight_kg),
      primary_discipline: draft.primary_discipline,
      preferred_side: draft.preferred_side,
      eligibility: draft.eligibility,
      age_range: draft.age_range,
      is_pacer: draft.is_pacer,
      is_oc_steer: draft.is_oc_steer,
      is_db_steer: draft.is_db_steer,
      is_drummer: draft.is_drummer,
      crew_tags: draft.crew_tags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Keep your paddling info up to date — your coach uses this for lineups.
        </p>
      </div>

      <Card>
        <CardHeader title="Profile Details" icon={<User size={16} />} />
        <div className="flex flex-col gap-4 p-4">
          <div>
            <label className={labelClassName}>Full name</label>
            <input
              value={draft.full_name}
              onChange={(e) => update({ full_name: e.target.value })}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={draft.weight_kg}
              onChange={(e) => update({ weight_kg: e.target.value })}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Discipline</label>
            <select
              value={draft.primary_discipline}
              onChange={(e) => update({ primary_discipline: e.target.value as Discipline })}
              className={selectClassName}
            >
              {DISCIPLINE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {showPreferredSide && (
            <div>
              <label className={labelClassName}>Preferred side</label>
              <div className="grid grid-cols-3 gap-1.5">
                {SIDE_OPTIONS.map((side) => (
                  <Chip
                    key={side}
                    active={draft.preferred_side === side}
                    onClick={() => update({ preferred_side: side })}
                  >
                    {side}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelClassName}>Eligibility</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_ELIGIBILITY_STATUSES.map((status) => (
                <Chip
                  key={status}
                  active={draft.eligibility === status}
                  onClick={() => update({ eligibility: status })}
                >
                  {status}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClassName}>Age range</label>
            <div className="grid grid-cols-4 gap-1.5">
              {ALL_AGE_RANGES.map((range) => (
                <Chip
                  key={range}
                  active={draft.age_range === range}
                  onClick={() => update({ age_range: range })}
                >
                  {range}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClassName}>Boat roles</label>
            <div className="grid grid-cols-2 gap-1.5">
              <Chip active={draft.is_pacer} onClick={() => update({ is_pacer: !draft.is_pacer })}>
                <Anchor size={13} /> Pacer
              </Chip>
              <Chip
                active={draft.is_drummer}
                onClick={() => update({ is_drummer: !draft.is_drummer })}
              >
                <Mic2 size={13} /> Drummer
              </Chip>
              <Chip
                active={draft.is_oc_steer}
                onClick={() => update({ is_oc_steer: !draft.is_oc_steer })}
              >
                <Compass size={13} /> OC Steer
              </Chip>
              <Chip
                active={draft.is_db_steer}
                onClick={() => update({ is_db_steer: !draft.is_db_steer })}
              >
                <Compass size={13} /> DB Steer
              </Chip>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className={labelClassName}>Crew categories</label>
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Gender
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {CREW_TAG_GENDER_OPTIONS.map((tag) => (
                  <Chip
                    key={tag}
                    active={draft.crew_tags.includes(tag)}
                    onClick={() => toggleCrewTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Age Range
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {CREW_TAG_AGE_RANGE_OPTIONS.map((tag) => (
                  <Chip
                    key={tag}
                    active={draft.crew_tags.includes(tag)}
                    onClick={() => toggleCrewTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Other
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {CREW_TAG_OTHER_OPTIONS.map((tag) => (
                  <Chip
                    key={tag}
                    active={draft.crew_tags.includes(tag)}
                    onClick={() => toggleCrewTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={cn(
              "mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-pitch-900",
              saved ? "scale-[1.02] bg-green-800" : "bg-green-700 hover:bg-green-800"
            )}
          >
            <Save size={15} /> {saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </Card>
    </div>
  );
}
