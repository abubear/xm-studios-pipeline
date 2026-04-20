import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { DEMO_MODE, DEMO_SESSIONS } from "@/lib/demo";

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  if (DEMO_MODE) {
    const session = DEMO_SESSIONS.find((s) => s.id === params.sessionId) ?? DEMO_SESSIONS[0];
    return NextResponse.json(session);
  }

  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("sessions")
    .select("*, ip_roster(id, name, universe, thumbnail_url, status, description)")
    .eq("id", params.sessionId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  if (DEMO_MODE) {
    const body = await request.json();
    const session = DEMO_SESSIONS.find((s) => s.id === params.sessionId) ?? DEMO_SESSIONS[0];
    return NextResponse.json({ ...session, ...body });
  }

  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { stage, status, name, config } = body;
  const updateData: Record<string, unknown> = {};
  if (stage !== undefined) updateData.stage = stage;
  if (status !== undefined) updateData.status = status;
  if (name !== undefined) updateData.name = name;
  if (config !== undefined) updateData.config = config;

  const { data, error } = await supabase
    .from("sessions")
    .update(updateData)
    .eq("id", params.sessionId)
    .select("*, ip_roster(id, name, universe, thumbnail_url, status)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
