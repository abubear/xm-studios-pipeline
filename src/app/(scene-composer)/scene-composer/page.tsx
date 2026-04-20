import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Clapperboard, ArrowRight } from "lucide-react";
import { DEMO_MODE, DEMO_SESSIONS } from "@/lib/demo";

export default async function SceneComposerPage() {
  let allSessions: Array<{
    id: string;
    name: string;
    stage: number;
    status: string;
    ip_roster: { name: string; universe: string } | null;
  }>;

  if (DEMO_MODE) {
    allSessions = DEMO_SESSIONS;
  } else {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("id, name, stage, status, ip_roster(name, universe)")
      .order("updated_at", { ascending: false });

    if (sessionsError) throw sessionsError;

    allSessions = (sessions ?? []) as typeof allSessions;
  }

  return (
    <div>
      <TopBar title="Scene Composer" />
      <div className="p-8">
        <h2 className="font-heading text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">
          Select a session
        </h2>

        {allSessions.length === 0 ? (
          <EmptyState
            icon={Clapperboard}
            title="No sessions yet"
            description="Create a session from the Dashboard to start composing scenes."
            action={{ label: "Go to Dashboard", href: "/dashboard" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allSessions.map((session) => (
              <Link
                key={session.id}
                href={`/scene-composer/${session.id}`}
                className="group p-5 bg-zinc-800 rounded-2xl border border-zinc-700 hover:border-amber-500/50 hover:bg-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {session.ip_roster?.name ?? session.name}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {session.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {session.ip_roster?.universe ?? ""}
                      {" · "}Stage {session.stage}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
