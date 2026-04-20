import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { DEMO_MODE, DEMO_SESSIONS, DEMO_USER_ID } from "@/lib/demo";

export async function GET() {
  if (DEMO_MODE) return NextResponse.json(DEMO_SESSIONS);

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
  if (DEMO_MODE) {
    const body = await request.json();
    const { ip_roster_id, name } = body;
    const newSession = {
      id: `demo-session-${Date.now()}`,
      ip_roster_id,
      name,
      stage: 0,
      status: "draft",
      config: {},
      created_by: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ip_roster: DEMO_SESSIONS[0].ip_roster,
    };
    return NextResponse.json(newSession, { status: 201 });
  }

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
