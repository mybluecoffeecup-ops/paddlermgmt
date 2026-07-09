"use client";

import { Dumbbell } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { MarkdownLite } from "@/components/ui/MarkdownLite";
import { formatRelativeTime } from "@/lib/utils";

export function WeeklyProgramCard() {
  const { workoutProgram } = useAppData();

  return (
    <Card>
      <CardHeader
        title="This Week's Program"
        subtitle="Land training & gym"
        icon={<Dumbbell size={16} />}
      />
      <div className="flex flex-col gap-2 p-4">
        {workoutProgram?.content.trim() ? (
          <>
            <MarkdownLite text={workoutProgram.content} />
            <p
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-300"
              suppressHydrationWarning
            >
              Posted {formatRelativeTime(workoutProgram.updated_at)}
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No program posted yet — check back soon.
          </p>
        )}
      </div>
    </Card>
  );
}
