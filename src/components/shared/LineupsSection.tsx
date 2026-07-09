"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, Plus } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { getBoatLayout } from "@/lib/boat-config";

export function LineupsSection({
  sessionId,
  raceId,
  defaultTitle,
}: {
  sessionId?: string;
  raceId?: string;
  defaultTitle: string;
}) {
  const { lineupsFor, createLineup, role } = useAppData();
  const router = useRouter();

  const lineups = lineupsFor({ sessionId, raceId });

  function handleCreate() {
    const newLineup = createLineup({
      session_id: sessionId ?? null,
      race_id: raceId ?? null,
      title: `${defaultTitle} Lineup`,
      boat: "DB22",
      seating_configuration: {},
      created_by: null,
    });
    router.push(`/lineups/${newLineup.id}`);
  }

  return (
    <Card>
      <CardHeader
        title="Lineups"
        subtitle={`${lineups.length} lineup${lineups.length === 1 ? "" : "s"}`}
        icon={<LayoutGrid size={16} />}
        action={
          role === "coach" ? (
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
            >
              <Plus size={13} /> Create Lineup
            </button>
          ) : undefined
        }
      />
      <ul className="divide-y divide-slate-100 dark:divide-white/10">
        {lineups.map((lineup) => (
          <li key={lineup.id}>
            <button
              onClick={() => router.push(`/lineups/${lineup.id}`)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {lineup.title}
                </p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {getBoatLayout(lineup.boat).name}
                </p>
              </div>
              <span className="text-xs font-bold text-green-700 dark:text-green-400">Open →</span>
            </button>
          </li>
        ))}
        {lineups.length === 0 && (
          <li className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <LayoutGrid size={28} className="text-slate-300 dark:text-white/20" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No lineups yet.
            </span>
          </li>
        )}
      </ul>
    </Card>
  );
}
