import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default async function StoreContentPage() {
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

  const sessions = (rawSessions ?? []) as unknown as {
    id: string;
    name: string;
    stage: number;
    status: string;
    ip_roster: {
      name: string;
      universe: string;
      thumbnail_url: string | null;
    } | null;
  }[];

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
                className="group bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden hover:shadow-md hover:border-zinc-200 transition-all"
              >
                <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
                  {session.ip_roster?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.ip_roster.thumbnail_url}
                      alt={session.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-zinc-300" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-heading text-sm font-semibold text-zinc-900 truncate">
                      {session.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors shrink-0" />
                  </div>
                  {session.ip_roster && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-medium text-zinc-500">
                        {session.ip_roster.universe}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {session.ip_roster.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-zinc-400 uppercase">
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
