"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEMO_MODE } from "@/lib/demo";
import type { UserRole } from "@/types/database";

async function assertAdmin() {
  if (DEMO_MODE) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = rawProfile as { role: string } | null;
  if (profile?.role !== "admin") throw new Error("Forbidden");

  return supabase;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await assertAdmin();
  if (!supabase) { revalidatePath("/admin"); return; }
  const { error } = await supabase
    .from("profiles")
    .update({ role } as never)
    .eq("id", userId);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function toggleStyleRule(ruleId: string, isActive: boolean) {
  const supabase = await assertAdmin();
  if (!supabase) { revalidatePath("/admin"); return; }
  const { error } = await supabase
    .from("style_guide_rules")
    .update({ is_active: isActive } as never)
    .eq("id", ruleId);
  if (error) throw error;
  revalidatePath("/admin");
}
