"use client";

import { useState } from "react";
import { CalendarPlus, Plus, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { CalendarCategoryBadge } from "@/components/ui/Badge";
import { formatDateRange } from "@/lib/calendar-utils";
import { cn, todayIso } from "@/lib/utils";
import { CALENDAR_EVENT_CATEGORIES, type CalendarEvent, type CalendarEventCategory, type Discipline } from "@/types";

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

const DISCIPLINE_OPTIONS: (Discipline | "")[] = ["", "DB", "OC", "Both"];

function NewEventForm({ onCreated }: { onCreated: (event: CalendarEvent) => void }) {
  const { createCalendarEvent, currentUserId } = useAppData();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(() => todayIso());
  const [endDate, setEndDate] = useState(() => todayIso());
  const [category, setCategory] = useState<CalendarEventCategory>("Other");
  const [discipline, setDiscipline] = useState<Discipline | "">("");
  const [notes, setNotes] = useState("");

  const canSubmit = title.trim() !== "" && startDate !== "" && endDate !== "" && endDate >= startDate;

  function handleCreate() {
    if (!canSubmit) return;
    const created = createCalendarEvent({
      title: title.trim(),
      start_date: startDate,
      end_date: endDate,
      category,
      discipline: discipline === "" ? null : discipline,
      notes: notes.trim() === "" ? null : notes.trim(),
      created_by: currentUserId,
    });
    onCreated(created);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-white/10">
      <div>
        <label className={labelClassName}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder="Month End Drinks"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClassName}>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClassName}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CalendarEventCategory)}
            className={inputClassName}
          >
            {CALENDAR_EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName}>Discipline</label>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as Discipline | "")}
            className={inputClassName}
          >
            {DISCIPLINE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d === "" ? "—" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClassName}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClassName}
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        <Plus size={15} /> Add to Calendar
      </button>
    </div>
  );
}

export function CalendarEventManager() {
  const { calendarEvents } = useAppData();
  const [isCreating, setIsCreating] = useState(false);

  const upcoming = [...calendarEvents]
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 8);

  return (
    <Card>
      <CardHeader
        title="Add Events"
        subtitle={`${calendarEvents.length} on the calendar`}
        icon={<CalendarPlus size={16} />}
        action={
          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
            )}
          >
            {isCreating ? <X size={13} /> : <Plus size={13} />}
            {isCreating ? "Cancel" : "New Event"}
          </button>
        }
      />
      {isCreating ? (
        <NewEventForm onCreated={() => setIsCreating(false)} />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {upcoming.map((event) => (
            <li key={event.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {event.title}
                </p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {formatDateRange(event.start_date, event.end_date)}
                </p>
              </div>
              <CalendarCategoryBadge category={event.category} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
