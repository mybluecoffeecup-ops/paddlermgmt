"use client";

import { useState } from "react";
import { CalendarClock, Plus, Radio, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { DisciplineBadge } from "@/components/ui/Badge";
import { MarkdownLite } from "@/components/ui/MarkdownLite";
import { addDaysIso, cn, formatSessionDate, todayIso } from "@/lib/utils";
import { SESSION_TYPE_OPTIONS, type Discipline, type Session, type SessionType } from "@/types";

const DISCIPLINE_OPTIONS: Discipline[] = ["DB", "OC", "Both"];

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

function NewSessionForm({ onCreated }: { onCreated: (session: Session) => void }) {
  const { createSession, currentUserId } = useAppData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [sessionDate, setSessionDate] = useState(() => todayIso());
  const [startTime, setStartTime] = useState("17:30");
  const [discipline, setDiscipline] = useState<Discipline>("Both");
  const [type, setType] = useState(SESSION_TYPE_OPTIONS[0]);
  const [capacityLimit, setCapacityLimit] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState("4");

  const canSubmit = title.trim() !== "" && sessionDate !== "" && startTime !== "";

  function handleCreate() {
    if (!canSubmit) return;

    const base = {
      title: title.trim(),
      description: description.trim() === "" ? null : description.trim(),
      location: location.trim() === "" ? null : location.trim(),
      start_time: startTime,
      discipline,
      type,
      capacity_limit: capacityLimit.trim() === "" ? null : parseInt(capacityLimit, 10),
      workout_program: null,
      created_by: currentUserId,
    };

    const occurrences = repeatWeekly
      ? Math.max(2, Math.min(12, parseInt(repeatWeeks, 10) || 4))
      : 1;

    // createSession updates local state and returns synchronously; the
    // Supabase write (when live) is fire-and-forget, so every occurrence
    // "succeeds" here by construction — there's no partial-failure case
    // to surface at this call site.
    let firstCreated: Session | null = null;
    for (let i = 0; i < occurrences; i++) {
      const created = createSession({ ...base, session_date: addDaysIso(sessionDate, i * 7) });
      if (i === 0) firstCreated = created;
    }
    if (firstCreated) onCreated(firstCreated);
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto border-b border-slate-100 p-4 dark:border-white/10">
      <div>
        <label className={labelClassName}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder="AM Sprint Technique"
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

      <div>
        <label className={labelClassName}>Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClassName}
          placeholder="Lake Union Boathouse"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClassName}>Date</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
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
            {DISCIPLINE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SessionType)}
            className={inputClassName}
          >
            {SESSION_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClassName}>Capacity limit</label>
        <input
          type="number"
          inputMode="numeric"
          value={capacityLimit}
          onChange={(e) => setCapacityLimit(e.target.value)}
          className={inputClassName}
          placeholder="Optional"
        />
      </div>

      <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200/70 p-3 dark:border-white/10">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={repeatWeekly}
            onChange={(e) => setRepeatWeekly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-400 text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          />
          Repeat weekly
        </label>
        {repeatWeekly && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={2}
                max={12}
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(e.target.value)}
                className={cn(inputClassName, "w-20")}
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">weeks</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Creates {Math.max(2, Math.min(12, parseInt(repeatWeeks, 10) || 4))} sessions, same
              details, one every 7 days starting {sessionDate || "the date above"}.
            </p>
          </>
        )}
      </div>

      <button
        onClick={handleCreate}
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        <Plus size={15} /> Create Session
      </button>
    </div>
  );
}

function WorkoutBroadcastEditor({ session }: { session: Session }) {
  const { updateSession } = useAppData();
  const [draft, setDraft] = useState(session.workout_program ?? "");
  const [saved, setSaved] = useState(false);

  function broadcast() {
    updateSession(session.id, { workout_program: draft });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Workout Program (markdown)
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={7}
          className="w-full rounded-2xl border border-slate-200/70 bg-white p-3 font-mono text-xs leading-relaxed text-slate-700 transition-shadow focus:shadow-soft focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-white/10 dark:bg-pitch-950/60 dark:text-slate-200"
          placeholder={"## Warm-up\n- 15 min easy paddle"}
        />
      </div>
      <button
        onClick={broadcast}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-pitch-900"
      >
        <Radio size={14} />
        {saved ? "Broadcast sent!" : "Broadcast to Crew"}
      </button>

      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Preview
        </p>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-3 dark:border-white/10 dark:bg-pitch-900/50">
          {draft.trim() ? (
            <MarkdownLite text={draft} />
          ) : (
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Nothing to preview yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SessionManager({
  selectedSessionId,
  onSelectSession,
}: {
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
}) {
  const { sessions } = useAppData();
  const [isCreating, setIsCreating] = useState(false);

  const sorted = [...sessions].sort((a, b) =>
    `${a.session_date}${a.start_time}`.localeCompare(`${b.session_date}${b.start_time}`)
  );
  const selected: Session | undefined = sorted.find((s) => s.id === selectedSessionId);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader
        title="Session Manager"
        subtitle={`${sessions.length} sessions`}
        icon={<CalendarClock size={16} />}
        action={
          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
          >
            {isCreating ? <X size={13} /> : <Plus size={13} />}
            {isCreating ? "Cancel" : "New Session"}
          </button>
        }
      />
      {isCreating ? (
        <NewSessionForm
          onCreated={(session) => {
            onSelectSession(session.id);
            setIsCreating(false);
          }}
        />
      ) : (
        <div className="max-h-48 overflow-y-auto border-b border-slate-100 dark:border-white/10">
          {sorted.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5 text-left last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 dark:border-white/5",
                session.id === selectedSessionId
                  ? "bg-green-50 dark:bg-green-500/10"
                  : "hover:bg-slate-50 dark:hover:bg-white/5"
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {session.title}
                </p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {formatSessionDate(session.session_date, session.start_time)}
                </p>
              </div>
              <DisciplineBadge discipline={session.discipline} />
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <WorkoutBroadcastEditor key={selected.id} session={selected} />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          Select a session above to broadcast a workout.
        </div>
      )}
    </Card>
  );
}
