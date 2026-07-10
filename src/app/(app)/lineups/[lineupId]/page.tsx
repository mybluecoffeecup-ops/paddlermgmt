import { LineupDetail } from "@/components/lineup/LineupDetail";

export default async function LineupEditorPage({
  params,
}: {
  params: Promise<{ lineupId: string }>;
}) {
  const { lineupId } = await params;
  return <LineupDetail key={lineupId} lineupId={lineupId} />;
}
