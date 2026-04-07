import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "./app-shell";
import type { Profile } from "@/types/database";

export async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    // Re-throw Next.js redirect/notFound signals
    if (
      err instanceof Error &&
      (err.message === "NEXT_REDIRECT" || err.message === "NEXT_NOT_FOUND")
    ) {
      throw err;
    }
    redirect("/login");
  }
}
