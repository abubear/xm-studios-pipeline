import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { StoreContentWorkspace } from "@/components/store-content/workspace";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_SESSION_ID } from "@/lib/demo";

export default async function StoreContentSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  if (DEMO_MODE) {
    const session =
      DEMO_SESSIONS.find((s) => s.id === params.sessionId) ??
      DEMO_SESSIONS.find((s) => s.id === DEMO_SESSION_ID)!;
    const ipRoster = session.ip_roster;
    return (
      <div>
        <TopBar title="Store Content Generator">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{session.name}</span>
            {ipRoster && (
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-lg">
                {ipRoster.universe}
              </span>
            )}
          </div>
        </TopBar>
        <StoreContentWorkspace
          sessionId={session.id}
          characterName={ipRoster?.name}
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

  if (sessionError?.code === "PGRST116" || !rawSession) redirect("/store-content");
  if (sessionError) throw sessionError;

  const session = rawSession as unknown as {
    id: string;
    name: string;
    stage: number;
    status: string;
    ip_roster: { name: string; universe: string } | null;
  };

  const ipRoster = session.ip_roster;

  return (
    <div>
      <TopBar title="Store Content Generator">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.name}</span>
          {ipRoster && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              {ipRoster.universe}
            </span>
          )}
        </div>
      </TopBar>
      <StoreContentWorkspace
        sessionId={params.sessionId}
        characterName={ipRoster?.name}
      />
    </div>
  );
}
