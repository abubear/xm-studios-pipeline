import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { DEMO_MODE, DEMO_SESSIONS } from "@/lib/demo";

export default async function StoreContentPage() {
  let sessions: Array<{
    id: string;
    name: string;
    stage: number;
    status: string;
    ip_roster: {
      name: string;
      universe: string;
      thumbnail_url: string | null;
    } | null;
  }>;

  if (DEMO_MODE) {
    sessions = DEMO_SESSIONS.map((s) => ({
      ...s,
      ip_roster: s.ip_roster
        ? {
            name: s.ip_roster.name,
            universe: s.ip_roster.universe,
            thumbnail_url: s.ip_roster.thumbnail_url,
          }
        : null,
    }));
  } else {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: rawSessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("id, name, stage, status, ip_roster(name, universe, thumbnail_url)")
      .order("updated_at", { ascending: false });

    if (sessionsError) throw sessionsError;

    sessions = (rawSessions ?? []) as unknown as typeof sessions;
  }

  return (
    <div>
      <TopBar title="Store Content Generator" />
      <div className="p-6">
        {sessions.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No Sessions Yet"
            description="Create a session in the Dashboard first, then come here to generate store content."
            action={{ label: "Go to Dashboard", href: "/dashboard" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/store-content/${session.id}`}
                className="group bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden hover:border-amber-500/50 hover:bg-zinc-700 transition-all"
              >
                <div className="h-32 bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {session.ip_roster?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.ip_roster.thumbnail_url}
                      alt={session.name}
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-zinc-600" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-heading text-sm font-semibold text-white truncate">
                      {session.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
                  </div>
                  {session.ip_roster && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-zinc-700 rounded text-[10px] font-medium text-zinc-400">
                        {session.ip_roster.universe}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {session.ip_roster.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-zinc-500 uppercase">
                      Stage {session.stage}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
