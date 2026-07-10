"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { SignupsDrawer } from "@/components/shared/SignupsDrawer";
import { cn } from "@/lib/utils";
import type { AttendanceStatus, Profile } from "@/types";

const STATUS_GROUPS: AttendanceStatus[] = ["Going", "Maybe", "Not Going"];

// Same soft-tint color semantics as AttendanceBadge's STATUS_STYLES
// (Badge.tsx), applied to a full-width row instead of a pill so the color
// meaning carries over without needing a badge on every row.
const ROW_STYLES: Record<AttendanceStatus, string> = {
  Going: "bg-green-500/10 text-green-800 hover:bg-green-500/15 dark:text-white dark:bg-green-400/10 dark:hover:bg-green-400/15",
  Maybe: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
  "Not Going":
    "bg-redcard-500/10 text-redcard-700 hover:bg-redcard-500/15 dark:text-white dark:bg-redcard-500/15 dark:hover:bg-redcard-500/20",
};

export function SignupsSection({
  sessionId,
  raceId,
}: {
  sessionId?: string;
  raceId?: string;
}) {
  const { attendanceFor, raceCommitments, profiles } = useAppData();
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);

  const rows = sessionId
    ? attendanceFor(sessionId)
    : raceCommitments.filter((c) => c.race_id === raceId);
  const statusByPaddler = new Map(rows.map((r) => [r.paddler_id, r.status]));

  const groups: Record<AttendanceStatus, Profile[]> = {
    Going: [],
    Maybe: [],
    "Not Going": [],
  };
  for (const profile of profiles) {
    const status = statusByPaddler.get(profile.id) ?? "Maybe";
    groups[status].push(profile);
  }
  for (const status of STATUS_GROUPS) {
    groups[status].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  return (
    <>
      <Card className="flex w-32 shrink-0 flex-col overflow-hidden sm:w-40">
        <CardHeader title="Signups" icon={<Users size={16} />} />
        {/* flex-1 on the list and each row (not a fixed padding) is what
            makes this panel match Details' height exactly, however tall
            Details ends up being, instead of guessing a padding value. */}
        <ul className="flex flex-1 flex-col divide-y divide-slate-100 dark:divide-white/10">
          {STATUS_GROUPS.map((status) => (
            <li key={status} className="flex-1">
              <button
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "flex h-full w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  ROW_STYLES[status]
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide">{status}</span>
                <span className="font-display text-lg font-bold tabular-nums">
                  {groups[status].length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <SignupsDrawer
        status={selectedStatus}
        people={selectedStatus ? groups[selectedStatus] : []}
        onClose={() => setSelectedStatus(null)}
      />
    </>
  );
}
