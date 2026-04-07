import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("finalists")
    .select("*, generated_images(id, url, thumbnail_url, prompt, seed, width, height, metadata)")
    .eq("session_id", params.sessionId)
    .order("rank", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { generated_image_id, rank } = body;

  if (!generated_image_id) {
    return NextResponse.json(
      { error: "generated_image_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("finalists")
    .insert({
      session_id: params.sessionId,
      generated_image_id,
      rank: rank ?? 0,
      selected_by: user.id,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { finalist_id } = body;

  const { error } = await supabase
    .from("finalists")
    .delete()
    .eq("id", finalist_id)
    .eq("session_id", params.sessionId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
