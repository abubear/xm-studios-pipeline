import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { FactoryPackageWorkspace } from "@/components/pipeline/factory-package-workspace";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_SESSION_ID } from "@/lib/demo";

export default async function FactoryPackagePage({
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
        <TopBar title="Factory Package — Stage 13">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{session.name}</span>
            {session.ip_roster && (
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-lg">
                {session.ip_roster.universe}
              </span>
            )}
          </div>
        </TopBar>
        <FactoryPackageWorkspace
          sessionId={session.id}
          characterName={session.ip_roster?.name}
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
    .select("id, name, ip_roster(name, universe)")
    .eq("id", params.sessionId)
    .single();

  if (sessionError?.code === "PGRST116" || !rawSession) redirect("/dashboard");
  if (sessionError) throw sessionError;

  const session = rawSession as unknown as {
    id: string;
    name: string;
    ip_roster: { name: string; universe: string } | null;
  };

  return (
    <div>
      <TopBar title="Factory Package — Stage 13">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.name}</span>
          {session.ip_roster && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              {session.ip_roster.universe}
            </span>
          )}
        </div>
      </TopBar>
      <FactoryPackageWorkspace
        sessionId={params.sessionId}
        characterName={session.ip_roster?.name}
      />
    </div>
  );
}
