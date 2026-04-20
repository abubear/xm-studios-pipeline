import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { TurnaroundWorkspace } from "@/components/pipeline/turnaround-workspace";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_SESSION_ID } from "@/lib/demo";

const DEMO_CONCEPTS = Array.from({ length: 4 }, (_, i) => ({
  id: `demo-finalist-${i + 1}`,
  url: `https://picsum.photos/seed/${300 + i}/512/512`,
  prompt: "Iron Man premium collectible statue, multi-angle turnaround view",
  rank: i + 1,
}));

export default async function TurnaroundPage({
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
        <TopBar title="Turnaround Sheets — Stage 08">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{session.name}</span>
            {session.ip_roster && (
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-lg">
                {session.ip_roster.universe}
              </span>
            )}
          </div>
        </TopBar>
        <TurnaroundWorkspace
          sessionId={session.id}
          characterName={session.ip_roster?.name}
          approvedConcepts={DEMO_CONCEPTS}
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
    .select("id, rank, generated_image_id, notes")
    .eq("session_id", params.sessionId)
    .order("rank", { ascending: true }) as unknown as {
    data: { id: string; rank: number; generated_image_id: string; notes: string | null }[] | null;
  };

  const imageIds = finalists?.map((f) => f.generated_image_id) || [];
  const { data: images } = await supabase
    .from("generated_images")
    .select("id, url, prompt")
    .in("id", imageIds.length > 0 ? imageIds : ["none"]) as unknown as {
    data: { id: string; url: string; prompt: string | null }[] | null;
  };

  const approvedConcepts = (finalists || []).map((f) => {
    const img = images?.find((i) => i.id === f.generated_image_id);
    return {
      id: f.id,
      url: img?.url || `https://picsum.photos/seed/${f.id}/512/512`,
      prompt: img?.prompt || undefined,
      rank: f.rank,
    };
  });

  return (
    <div>
      <TopBar title="Turnaround Sheets — Stage 08">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.name}</span>
          {session.ip_roster && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">
              {session.ip_roster.universe}
            </span>
          )}
        </div>
      </TopBar>
      <TurnaroundWorkspace
        sessionId={params.sessionId}
        characterName={session.ip_roster?.name}
        approvedConcepts={approvedConcepts}
      />
    </div>
  );
}
