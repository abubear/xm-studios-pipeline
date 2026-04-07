import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { SceneComposerWorkspace } from "@/components/scene-composer/workspace";

export default async function SceneComposerSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rawSession } = await supabase
    .from("sessions")
    .select("id, name, stage, status, ip_roster(name, universe)")
    .eq("id", params.sessionId)
    .single();

  if (!rawSession) redirect("/scene-composer");

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
      <TopBar title="Scene Composer">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.name}</span>
          {ipRoster && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              {ipRoster.universe}
            </span>
          )}
        </div>
      </TopBar>
      <SceneComposerWorkspace
        sessionId={params.sessionId}
        characterName={ipRoster?.name}
      />
    </div>
  );
}
