import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JuryWorkspace } from "@/components/jury/jury-workspace";

export default async function JurySessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
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
