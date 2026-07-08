"use client";

import { Calendar, Check, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { DisciplineBadge } from "@/components/ui/Badge";
import { cn, formatSessionDate } from "@/lib/utils";

export function UpcomingSessions() {
  const { sessions, currentUserId, attendanceStatusFor, rsvpToSession } = useAppData();

  const upcoming = [...sessions].sort((a, b) =>
    `${a.session_date}${a.start_time}`.localeCompare(`${b.session_date}${b.start_time}`)
  );

  return (
    <Card>
      <CardHeader
        title="Upcoming Sessions"
        subtitle={`${upcoming.length} scheduled`}
        icon={<Calendar size={16} />}
      />
      <ul className="divide-y divide-slate-100 dark:divide-white/10">
        {upcoming.map((session) => {
          const status = attendanceStatusFor(session.id, currentUserId);
          return (
            <li key={session.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {session.title}
                  </p>
                  <DisciplineBadge discipline={session.discipline} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {formatSessionDate(session.session_date, session.start_time)} · {session.type}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => rsvpToSession(session.id, "Attending")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                    status === "Attending"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 dark:border-white/15"
                  )}
                  aria-label="RSVP Attending"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                <button
                  onClick={() => rsvpToSession(session.id, "Absent")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                    status === "Absent"
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-500 dark:border-white/15"
                  )}
                  aria-label="RSVP Absent"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
