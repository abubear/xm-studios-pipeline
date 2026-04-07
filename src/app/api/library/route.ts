import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const ipRosterId = searchParams.get("ip_roster_id");
  const tagsParam = searchParams.get("tags");
  const format = searchParams.get("format");

  let query = supabase
    .from("character_library")
    .select("*, models_3d(*), ip_roster(id, name, universe)")
    .order("updated_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (ipRosterId) {
    query = query.eq("ip_roster_id", ipRosterId);
  }

  if (tagsParam) {
    const tags = tagsParam.split(",");
    query = query.contains("tags", tags);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by format client-side (join table limitation)
  let results = data ?? [];
  if (format) {
    results = results.filter((entry: Record<string, unknown>) => {
      const model = entry.models_3d as Record<string, unknown> | null;
      return model && (model.format as string) === format;
    });
  }

  return NextResponse.json(results);
}
