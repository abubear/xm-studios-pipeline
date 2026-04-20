import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { ModelGenerationWorkspace } from "@/components/pipeline/model-generation-workspace";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_SESSION_ID } from "@/lib/demo";

export default async function ModelGenerationPage({
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
        <TopBar title="3D Generation + Rigging — Stages 09-10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{session.name}</span>
            {session.ip_roster && (
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-lg">
                {session.ip_roster.universe}
              </span>
            )}
          </div>
        </TopBar>
        <ModelGenerationWorkspace
          sessionId={session.id}
          characterName={session.ip_roster?.name}
          frontViewUrl="https://picsum.photos/seed/ironman-front/512/768"
          topViewUrl="https://picsum.photos/seed/ironman-top/512/768"
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

  const { data: finalists } = await supabase
    .from("finalists")
    .select("generated_image_id")
    .eq("session_id", params.sessionId)
    .order("rank", { ascending: true })
    .limit(2) as unknown as { data: { generated_image_id: string }[] | null };

  const imageIds = finalists?.map((f) => f.generated_image_id) || [];
  const { data: images } = await supabase
    .from("generated_images")
    .select("id, url")
    .in("id", imageIds.length > 0 ? imageIds : ["none"]) as unknown as { data: { id: string; url: string }[] | null };

  return (
    <div>
      <TopBar title="3D Generation + Rigging — Stages 09-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.name}</span>
          {session.ip_roster && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              {session.ip_roster.universe}
            </span>
          )}
        </div>
      </TopBar>
      <ModelGenerationWorkspace
        sessionId={params.sessionId}
        characterName={session.ip_roster?.name}
        frontViewUrl={images?.[0]?.url}
        topViewUrl={images?.[1]?.url}
      />
    </div>
  );
}
