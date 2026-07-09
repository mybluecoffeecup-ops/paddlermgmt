import { RaceDetail } from "@/components/races/RaceDetail";

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  return <RaceDetail raceId={raceId} />;
}
