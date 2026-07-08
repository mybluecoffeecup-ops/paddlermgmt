"use client";

import { useState } from "react";
import { CalendarClock, Radio } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { DisciplineBadge } from "@/components/ui/Badge";
import { MarkdownLite } from "@/components/ui/MarkdownLite";
import { cn, formatSessionDate } from "@/lib/utils";
import type { Session } from "@/types";

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
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Workout Program (markdown)
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={7}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-white/10 dark:bg-black/20 dark:text-slate-200"
          placeholder={"## Warm-up\n- 15 min easy paddle"}
        />
      </div>
      <button
        onClick={broadcast}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        <Radio size={14} />
        {saved ? "Broadcast sent!" : "Broadcast to Crew"}
      </button>

      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Preview
        </p>
        <div className="rounded-lg border border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          {draft.trim() ? (
            <MarkdownLite text={draft} />
          ) : (
            <p className="text-xs text-slate-400">Nothing to preview yet.</p>
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

  const sorted = [...sessions].sort((a, b) =>
    `${a.session_date}${a.start_time}`.localeCompare(`${b.session_date}${b.start_time}`)
  );
  const selected: Session | undefined = sorted.find((s) => s.id === selectedSessionId);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader
        title="Session Manager"
        subtitle={`${sessions.length} sessions`}
        icon={<CalendarClock size={16} />}
      />
      <div className="max-h-48 overflow-y-auto border-b border-slate-100 dark:border-white/10">
        {sorted.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={cn(
              "flex w-full items-center justify-between gap-2 border-b border-slate-50 px-4 py-2.5 text-left last:border-0 dark:border-white/5",
              session.id === selectedSessionId
                ? "bg-teal-50 dark:bg-teal-500/10"
                : "hover:bg-slate-50 dark:hover:bg-white/5"
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {session.title}
              </p>
              <p className="text-[11px] text-slate-400">
                {formatSessionDate(session.session_date, session.start_time)}
              </p>
            </div>
            <DisciplineBadge discipline={session.discipline} />
          </button>
        ))}
      </div>

      {selected ? (
        <WorkoutBroadcastEditor key={selected.id} session={selected} />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-400">
          Select a session above to broadcast a workout.
        </div>
      )}
    </Card>
  );
}
