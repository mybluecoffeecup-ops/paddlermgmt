"use client";

import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useAppData } from "@/hooks/app-data";
import { getBoatLayout } from "@/lib/boat-config";
import { BenchList } from "@/components/lineup/BenchList";
import { BoatCanvas } from "@/components/lineup/BoatCanvas";
import { TelemetryBar } from "@/components/lineup/TelemetryBar";
import { PaddlerColorKey } from "@/components/lineup/PaddlerColorKey";
import type { Profile } from "@/types";

export function LineupViewer({ lineupId }: { lineupId: string }) {
  const { lineups, sessions, races, raceCommitments, profiles, attendanceFor } = useAppData();

  const lineup = lineups.find((l) => l.id === lineupId);
  const session = sessions.find((s) => s.id === lineup?.session_id);
  const race = races.find((r) => r.id === lineup?.race_id);
  const target = session ?? race;

  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const attendingProfiles = useMemo(() => {
    if (session) {
      const ids = attendanceFor(session.id)
        .filter((a) => a.status === "Going")
        .map((a) => a.paddler_id);
      return ids.map((id) => profileById.get(id)).filter((p): p is Profile => Boolean(p));
    }
    if (race) {
      const ids = raceCommitments
        .filter((c) => c.race_id === race.id && c.status === "Going")
        .map((c) => c.paddler_id);
      return ids.map((id) => profileById.get(id)).filter((p): p is Profile => Boolean(p));
    }
    return [];
  }, [session, race, attendanceFor, raceCommitments, profileById]);

  const backHref = session ? `/sessions/${session.id}` : race ? `/races/${race.id}` : "/";

  if (!lineup || !target) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
        Lineup not found.{" "}
        <Link href="/" className="font-bold text-green-700 dark:text-green-400">
          Back home
        </Link>
      </div>
    );
  }

  const layout = getBoatLayout(lineup.boat);
  const seating = lineup.seating_configuration;
  const seatedIds = new Set(Object.values(seating).filter((v): v is string => Boolean(v)));
  const benchPaddlers = attendingProfiles.filter((p) => !seatedIds.has(p.id));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href={backHref}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 text-slate-700 shadow-soft transition-all hover:bg-slate-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              {lineup.title}
            </h1>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {session ? session.title : race!.name} · {layout.name}
            </p>
          </div>
        </div>
      </div>

      <TelemetryBar layout={layout} seating={seating} profileById={profileById} />
      <PaddlerColorKey />

      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[16rem_1fr] md:items-start">
        <div className="md:h-[65vh]">
          <BenchList paddlers={benchPaddlers} />
        </div>
        <div className="md:h-[65vh]">
          <BoatCanvas layout={layout} seating={seating} profileById={profileById} />
        </div>
      </div>
    </div>
  );
}
