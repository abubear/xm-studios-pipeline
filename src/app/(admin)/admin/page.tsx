import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { Profile, IPRoster, StyleGuideRule } from "@/types/database";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Role guard — admin only
  const { data: rawCurrentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profileError) throw profileError;
  const currentProfile = rawCurrentProfile as { role: string } | null;
  if (currentProfile?.role !== "admin") redirect("/dashboard");

  // Fetch all data in parallel
  const [
    { data: users, error: usersError },
    { data: ipRoster, error: ipError },
    { data: styleRules, error: rulesError },
    { count: totalSessions },
    { count: activeSessions },
    { count: totalGeneratedImages },
    { count: totalVotes },
    { count: totalFinalists },
    { count: publishedPackages },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("ip_roster").select("*").order("name"),
    supabase.from("style_guide_rules").select("*").order("category"),
    supabase.from("sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("generated_images")
      .select("*", { count: "exact", head: true }),
    supabase.from("votes").select("*", { count: "exact", head: true }),
    supabase.from("finalists").select("*", { count: "exact", head: true }),
    supabase
      .from("factory_packages")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  if (usersError) throw usersError;
  if (ipError) throw ipError;
  if (rulesError) throw rulesError;

  return (
    <div>
      <TopBar title="Admin Panel" />
      <div className="p-8">
        <AdminDashboard
          currentUserId={user.id}
          users={(users ?? []) as Profile[]}
          ipRoster={(ipRoster ?? []) as IPRoster[]}
          styleRules={(styleRules ?? []) as StyleGuideRule[]}
          stats={{
            totalSessions: totalSessions ?? 0,
            activeSessions: activeSessions ?? 0,
            totalGeneratedImages: totalGeneratedImages ?? 0,
            totalVotes: totalVotes ?? 0,
            totalFinalists: totalFinalists ?? 0,
            publishedPackages: publishedPackages ?? 0,
          }}
        />
      </div>
    </div>
  );
}
