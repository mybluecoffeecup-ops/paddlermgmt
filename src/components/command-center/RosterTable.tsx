"use client";

import { ClipboardList } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { AttendanceBadge } from "@/components/ui/Badge";
import { cn, formatWeight } from "@/lib/utils";
import type { AttendanceStatus, Profile } from "@/types";

const SIDE_DOT: Record<string, string> = {
  Left: "bg-rose-500",
  Right: "bg-blue-500",
  Ambi: "bg-violet-500",
};

const STATUS_CYCLE: AttendanceStatus[] = ["Maybe", "Going", "Not Going"];

export function RosterTable({
  sessionId,
  profiles,
}: {
  sessionId: string | null;
  profiles: Profile[];
}) {
  const { attendanceStatusFor, rsvpToSession } = useAppData();

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader
        title="Roster"
        subtitle={`${profiles.length} paddlers in view`}
        icon={<ClipboardList size={16} />}
      />
      <div className="overflow-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">Paddler</th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-left">Side</th>
              <th className="px-3 py-2 text-left">Crew</th>
              <th className="px-3 py-2 text-left">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {profiles.map((p) => {
              const status = sessionId ? attendanceStatusFor(sessionId, p.id) : "Maybe";
              return (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-100">
                    {p.full_name}
                    {p.is_coach && (
                      <span className="ml-1.5 text-[10px] font-bold text-green-700 dark:text-green-300">
                        COACH
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    {formatWeight(p.weight_kg)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <span className={cn("h-2 w-2 rounded-full", SIDE_DOT[p.preferred_side])} />
                      {p.preferred_side}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    {p.crew_tags.join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      disabled={!sessionId}
                      onClick={() => {
                        if (!sessionId) return;
                        const next =
                          STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];
                        rsvpToSession(sessionId, next, p.id);
                      }}
                      className="rounded-full transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-40"
                      title="Click to cycle attendance status"
                    >
                      <AttendanceBadge status={status} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No paddlers match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
