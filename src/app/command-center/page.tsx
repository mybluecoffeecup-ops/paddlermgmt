"use client";

import { useMemo, useState } from "react";

import { useAppData } from "@/hooks/app-data";
import { FilterSidebar } from "@/components/command-center/FilterSidebar";
import { MetricsSummary } from "@/components/command-center/MetricsSummary";
import { SessionManager } from "@/components/command-center/SessionManager";
import { RosterTable } from "@/components/command-center/RosterTable";
import type { Discipline } from "@/types";

export default function CommandCenterPage() {
  const { profiles, sessions } = useAppData();
  const [disciplines, setDisciplines] = useState<Set<Discipline>>(new Set());
  const [crewTags, setCrewTags] = useState<Set<string>>(new Set());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions[0]?.id ?? null
  );

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) => {
      const next = new Set(prev);
      if (next.has(d)) {
        next.delete(d);
      } else {
        next.add(d);
      }
      return next;
    });
  }

  function toggleCrewTag(tag: string) {
    setCrewTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const disciplineMatch =
        disciplines.size === 0 ||
        disciplines.has(p.primary_discipline) ||
        (disciplines.has("Both") && p.primary_discipline === "Both");
      const crewMatch = crewTags.size === 0 || p.crew_tags.some((t) => crewTags.has(t));
      return disciplineMatch && crewMatch;
    });
  }, [profiles, disciplines, crewTags]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          Command Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Roster segmentation, session broadcasts, and readiness at a glance.
        </p>
      </div>

      <MetricsSummary session={selectedSession} rosterProfiles={filteredProfiles} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[15rem_22rem_1fr] xl:items-start">
        <FilterSidebar
          disciplines={disciplines}
          onToggleDiscipline={toggleDiscipline}
          crewTags={crewTags}
          onToggleCrewTag={toggleCrewTag}
        />
        <SessionManager
          selectedSessionId={selectedSessionId}
          onSelectSession={setSelectedSessionId}
        />
        <RosterTable sessionId={selectedSessionId} profiles={filteredProfiles} />
      </div>
    </div>
  );
}
