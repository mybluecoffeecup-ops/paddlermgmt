"use client";

import { useState } from "react";
import { ClipboardList, ShieldMinus, ShieldPlus } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { AttendanceBadge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
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
  const {
    attendanceStatusFor,
    rsvpToSession,
    updateProfile,
    currentUserId,
    profiles: allProfiles,
  } = useAppData();
  const [roleTarget, setRoleTarget] = useState<Profile | null>(null);
  const coachCount = allProfiles.filter((p) => p.is_coach).length;

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
              const isSelf = p.id === currentUserId;
              const isLastCoach = p.is_coach && coachCount <= 1;
              const roleControlDisabled = isSelf || isLastCoach;
              const roleControlTitle = isSelf
                ? "You can't change your own coach access here"
                : isLastCoach
                  ? "At least one coach must remain"
                  : p.is_coach
                    ? `Demote ${p.full_name} to paddler`
                    : `Promote ${p.full_name} to coach`;
              return (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-100">
                    <span className="inline-flex items-center gap-1.5">
                      {p.full_name}
                      {p.is_coach && (
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-300">
                          COACH
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={roleControlDisabled}
                        onClick={() => setRoleTarget(p)}
                        title={roleControlTitle}
                        aria-label={roleControlTitle}
                        className="rounded text-slate-500 transition-colors hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:text-green-300"
                      >
                        {p.is_coach ? <ShieldMinus size={14} /> : <ShieldPlus size={14} />}
                      </button>
                    </span>
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
      <Dialog
        open={roleTarget !== null}
        title={roleTarget?.is_coach ? "Demote to paddler?" : "Promote to coach?"}
        description={
          roleTarget?.is_coach
            ? `${roleTarget?.full_name} will lose coach access to Session Mgmt and Lineups, and will only see paddler-facing pages.`
            : `${roleTarget?.full_name} will gain coach access to Session Mgmt and Lineups, in addition to their existing paddler access.`
        }
        onOpenChange={(open) => {
          if (!open) setRoleTarget(null);
        }}
        actions={[
          {
            label: "Cancel",
            variant: "ghost",
            onClick: () => setRoleTarget(null),
          },
          {
            label: roleTarget?.is_coach ? "Demote" : "Promote",
            variant: roleTarget?.is_coach ? "caution" : "primary",
            autoFocus: true,
            onClick: () => {
              if (roleTarget) {
                updateProfile(roleTarget.id, { is_coach: !roleTarget.is_coach });
              }
              setRoleTarget(null);
            },
          },
        ]}
      />
    </Card>
  );
}
