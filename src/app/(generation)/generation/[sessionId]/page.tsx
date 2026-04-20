import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { MassGenerationWorkspace } from "@/components/generation/mass-generation-workspace";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_SESSION_ID } from "@/lib/demo";

export default async function MassGenerationPage({
  params,
}: {
  params: { sessionId: string };
}) {
  if (DEMO_MODE) {
    const session =
      DEMO_SESSIONS.find((s) => s.id === params.sessionId) ??
      DEMO_SESSIONS.find((s) => s.id === DEMO_SESSION_ID)!;
    return (
      <div>
        <TopBar title="Mass Generation — Stage 03">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{session.name}</span>
            {session.ip_roster && (
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-lg">
                {session.ip_roster.universe}
              </span>
            )}
            <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 text-xs font-semibold rounded-lg">
              Stage {session.stage}
            </span>
          </div>
        </TopBar>
        <MassGenerationWorkspace
          sessionId={session.id}
          characterName={session.ip_roster?.name}
          masterReferenceUrl={`https://picsum.photos/seed/ironman-ref/512/768`}
        />
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rawSession, error: sessionError } = await supabase
    .from("sessions")
    .select("id, name, stage, status, ip_roster(name, universe)")
    .eq("id", params.sessionId)
    .single();

  if (sessionError?.code === "PGRST116" || !rawSession) redirect("/dashboard");
  if (sessionError) throw sessionError;

  const session = rawSession as unknown as {
    id: string;
    name: string;
    stage: number;
    status: string;
    ip_roster: { name: string; universe: string } | null;
  };

  const { data: refs } = await supabase
    .from("reference_images")
    .select("url")
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: true })
    .limit(1) as unknown as { data: { url: string }[] | null };

  return (
    <div>
      <TopBar title="Mass Generation — Stage 03">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.name}</span>
          {session.ip_roster && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              {session.ip_roster.universe}
            </span>
          )}
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">
            Stage {session.stage}
          </span>
        </div>
      </TopBar>
      <MassGenerationWorkspace
        sessionId={params.sessionId}
        characterName={session.ip_roster?.name}
        masterReferenceUrl={refs?.[0]?.url}
      />
    </div>
  );
}
