import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("sessions")
    .select("*, ip_roster(id, name, universe, thumbnail_url, status)")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { ip_roster_id, name } = body;

  if (!ip_roster_id || !name) {
    return NextResponse.json({ error: "ip_roster_id and name are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ ip_roster_id, name, stage: 0, status: "draft", created_by: user.id })
    .select("*, ip_roster(id, name, universe, thumbnail_url, status)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
