import { SessionDetailContent } from "@/components/dashboard/session-detail-content";

export default function SessionDetailPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return <SessionDetailContent sessionId={params.sessionId} />;
}
