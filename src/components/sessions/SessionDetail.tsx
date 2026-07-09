"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Pencil, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { DisciplineBadge } from "@/components/ui/Badge";
import { CommentsSection } from "@/components/shared/CommentsSection";
import { LineupsSection } from "@/components/shared/LineupsSection";
import { formatSessionDate } from "@/lib/utils";
import { SESSION_TYPE_OPTIONS, type Discipline, type Session, type SessionType } from "@/types";

const DISCIPLINE_OPTIONS: Discipline[] = ["DB", "OC", "Both"];

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

function EditForm({ session, onDone }: { session: Session; onDone: () => void }) {
  const { updateSession, notifyAll } = useAppData();

  const [title, setTitle] = useState(session.title);
  const [description, setDescription] = useState(session.description ?? "");
  const [location, setLocation] = useState(session.location ?? "");
  const [sessionDate, setSessionDate] = useState(session.session_date);
  const [startTime, setStartTime] = useState(session.start_time);
  const [discipline, setDiscipline] = useState<Discipline>(session.discipline);
  const [type, setType] = useState<SessionType>(session.type);
  const [capacityLimit, setCapacityLimit] = useState(
    session.capacity_limit != null ? String(session.capacity_limit) : ""
  );

  const canSave = title.trim() !== "" && sessionDate !== "" && startTime !== "";

  function handleSave() {
    if (!canSave) return;
    updateSession(session.id, {
      title: title.trim(),
      description: description.trim() === "" ? null : description.trim(),
      location: location.trim() === "" ? null : location.trim(),
      session_date: sessionDate,
      start_time: startTime,
      discipline,
      type,
      capacity_limit: capacityLimit.trim() === "" ? null : parseInt(capacityLimit, 10),
    });
    notifyAll("Session updated", `${title.trim()} was updated by a coach.`, {
      sessionId: session.id,
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <label className={labelClassName}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const { sessions, role } = useAppData();
  const [isEditing, setIsEditing] = useState(false);

  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
        Session not found.{" "}
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
            {session.title}
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
        <CardHeader title="Details" icon={<Calendar size={16} />} />
        {isEditing ? (
          <EditForm session={session} onDone={() => setIsEditing(false)} />
        ) : (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <DisciplineBadge discipline={session.discipline} />
              <span className="rounded-full border border-slate-200/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-300">
                {session.type}
              </span>
            </div>
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Clock size={14} className="text-slate-400" />
              {formatSessionDate(session.session_date, session.start_time)}
            </p>
            {session.location && (
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <MapPin size={14} className="text-slate-400" />
                {session.location}
              </p>
            )}
            {session.capacity_limit != null && (
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Capacity: {session.capacity_limit}
              </p>
            )}
            {session.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{session.description}</p>
            )}
          </div>
        )}
      </Card>

      <LineupsSection sessionId={session.id} defaultTitle={session.title} />
      <CommentsSection sessionId={session.id} />
    </div>
  );
}
