"use client";

import { useState } from "react";
import { Dumbbell, Radio } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { MarkdownLite } from "@/components/ui/MarkdownLite";
import { formatRelativeTime } from "@/lib/utils";

export function WorkoutProgramPanel() {
  const { workoutProgram, updateWorkoutProgram, notifyAll, profiles } = useAppData();
  const [draft, setDraft] = useState(workoutProgram?.content ?? "");
  const [saved, setSaved] = useState(false);

  function broadcast() {
    updateWorkoutProgram(draft);
    notifyAll(
      "Weekly Workout Program Updated",
      "This week's land training & gym program has been posted — check the dashboard for details.",
      {}
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const updatedByName = profiles.find((p) => p.id === workoutProgram?.updated_by)?.full_name;

  return (
    <Card>
      <CardHeader
        title="Weekly Workout Program"
        subtitle="Land training & gym — updated weekly, not tied to any session"
        icon={<Dumbbell size={16} />}
      />
      <div className="flex flex-col gap-3 p-4">
        {workoutProgram && (
          <p
            className="text-[11px] font-semibold text-slate-600 dark:text-slate-300"
            suppressHydrationWarning
          >
            Last updated {formatRelativeTime(workoutProgram.updated_at)}
            {updatedByName ? ` by ${updatedByName}` : ""}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Program (markdown)
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={7}
            className="w-full rounded-2xl border border-slate-200/70 bg-white p-3 font-mono text-xs leading-relaxed text-slate-700 transition-shadow focus:shadow-soft focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-white/10 dark:bg-pitch-950/60 dark:text-slate-200"
            placeholder={"## Warm-up\n- 10 min dynamic mobility"}
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
    </Card>
  );
}
