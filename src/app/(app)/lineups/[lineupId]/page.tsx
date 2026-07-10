import { LineupEditor } from "@/components/lineup/LineupEditor";

export default async function LineupEditorPage({
  params,
}: {
  params: Promise<{ lineupId: string }>;
}) {
  const { lineupId } = await params;
  return <LineupEditor key={lineupId} lineupId={lineupId} />;
}
