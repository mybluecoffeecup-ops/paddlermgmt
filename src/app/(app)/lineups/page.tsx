"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Plus } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { getBoatLayout } from "@/lib/boat-config";
import { formatSessionDate } from "@/lib/utils";
import type { BoatType } from "@/types";

const BOAT_OPTIONS: { value: BoatType; label: string }[] = [
  { value: "DB12", label: "DB12 — Small Dragon Boat (2×6)" },
  { value: "DB22", label: "DB22 — Dragon Boat (2×11)" },
  { value: "V6", label: "V6 — Outrigger Six (1×6)" },
];

export default function LineupsPage() {
  const { sessions, lineups, createLineup } = useAppData();
  const router = useRouter();

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        `${a.session_date}${a.start_time}`.localeCompare(`${b.session_date}${b.start_time}`)
      ),
    [sessions]
  );

  const [sessionId, setSessionId] = useState(sortedSessions[0]?.id ?? "");
  const [boat, setBoat] = useState<BoatType>("DB22");
  const [title, setTitle] = useState("");

  const sessionLineups = lineups.filter((l) => l.session_id === sessionId);

  function handleCreate() {
    if (!sessionId) return;
    const session = sessions.find((s) => s.id === sessionId);
    const newLineup = createLineup({
      session_id: sessionId,
      title: title.trim() || `${session?.title ?? "Session"} Lineup`,
      boat,
      seating_configuration: {},
      created_by: null,
    });
    router.push(`/lineups/${newLineup.id}`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          Lineup Generator
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Build a seat-by-seat crew for any session or race.
        </p>
      </div>

      <Card>
        <CardHeader title="New Lineup" icon={<Plus size={16} />} />
        <div className="flex flex-col gap-3 p-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Session
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-800"
            >
              {sortedSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {formatSessionDate(s.session_date, s.start_time)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Boat
            </label>
            <select
              value={boat}
              onChange={(e) => setBoat(e.target.value as BoatType)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-800"
            >
              {BOAT_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Race Sim A Crew"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-800"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!sessionId}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-40"
          >
            <Plus size={15} /> Create Lineup
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Existing Lineups"
          subtitle={sessionId ? `${sessionLineups.length} for selected session` : undefined}
          icon={<LayoutGrid size={16} />}
        />
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {sessionLineups.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => router.push(`/lineups/${l.id}`)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{l.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getBoatLayout(l.boat).name}
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-300">
                  Open →
                </span>
              </button>
            </li>
          ))}
          {sessionLineups.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              No lineups yet for this session.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
