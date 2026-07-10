"use client";

import { useAppData } from "@/hooks/app-data";
import { LineupEditor } from "@/components/lineup/LineupEditor";
import { LineupViewer } from "@/components/lineup/LineupViewer";

export function LineupDetail({ lineupId }: { lineupId: string }) {
  const { role, loading, currentUser } = useAppData();
  const resolved = !loading && currentUser !== undefined;

  if (!resolved) return null;

  return role === "coach" ? (
    <LineupEditor lineupId={lineupId} />
  ) : (
    <LineupViewer lineupId={lineupId} />
  );
}
