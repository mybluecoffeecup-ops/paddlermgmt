"use client";

import { Flag } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { RaceManager } from "@/components/command-center/RaceManager";
import { WorkInProgress } from "@/components/ui/WorkInProgress";

export default function RacesPage() {
  const { role, loading, currentUser } = useAppData();
  const resolved = !loading && currentUser !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          Race Mgmt
        </h1>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Race calendar management for coaches, and signups for the whole crew.
        </p>
      </div>

      {resolved && role === "coach" && <RaceManager />}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Flag size={15} className="text-slate-600 dark:text-slate-300" />
          <h2 className="font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Race Signups
          </h2>
        </div>
        <WorkInProgress
          title="Race Signups"
          description="A unified Going / Maybe / Not Going view for paddlers and coaches is coming here. For now, RSVP from a race's own page."
        />
      </div>
    </div>
  );
}
