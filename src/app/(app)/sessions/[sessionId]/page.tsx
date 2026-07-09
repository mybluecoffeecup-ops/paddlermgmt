import { SessionDetail } from "@/components/sessions/SessionDetail";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <SessionDetail sessionId={sessionId} />;
}
