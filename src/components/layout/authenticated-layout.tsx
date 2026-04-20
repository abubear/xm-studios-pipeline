import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "./app-shell";
import { DEMO_MODE, DEMO_PROFILE } from "@/lib/demo";
import type { Profile } from "@/types/database";

export async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In demo mode serve a mock admin profile so every section renders
  if (DEMO_MODE) {
    return <AppShell profile={DEMO_PROFILE}>{children}</AppShell>;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) redirect("/login");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) redirect("/login");

    return <AppShell profile={profile as Profile}>{children}</AppShell>;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message === "NEXT_REDIRECT" || err.message === "NEXT_NOT_FOUND")
    ) {
      throw err;
    }
    redirect("/login");
  }
}
