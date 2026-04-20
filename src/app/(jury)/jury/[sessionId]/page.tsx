import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JuryWorkspace } from "@/components/jury/jury-workspace";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_SESSION_ID } from "@/lib/demo";

export default async function JurySessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  if (DEMO_MODE) {
    const session =
      DEMO_SESSIONS.find((s) => s.id === params.sessionId) ??
      DEMO_SESSIONS.find((s) => s.id === DEMO_SESSION_ID)!;
    return (
      <JuryWorkspace sessionId={session.id} sessionName={session.name} />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, name, stage, status")
    .eq("id", params.sessionId)
    .single();

  if (sessionError?.code === "PGRST116" || !session) redirect("/jury");
  if (sessionError) throw sessionError;

  return (
    <JuryWorkspace
      sessionId={(session as { id: string }).id}
      sessionName={(session as { name: string }).name}
    />
  );
}
