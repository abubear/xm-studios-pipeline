import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") throw profileError;

  const firstName =
    (profileData as { full_name: string } | null)?.full_name?.split(" ")[0] ??
    "there";

  return (
    <div className="p-8">
      <DashboardContent firstName={firstName} />
    </div>
  );
}
