import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reference_images")
    .select("*")
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
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
  const { url, source, source_id, caption, tags, width, height, metadata } =
    body;

  if (!url || !source) {
    return NextResponse.json(
      { error: "url and source are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reference_images")
    .insert({
      session_id: params.sessionId,
      url,
      source,
      source_id: source_id || null,
      caption: caption || null,
      tags: tags || [],
      width: width || null,
      height: height || null,
      metadata: metadata || {},
      created_by: user.id,
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

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("id");

  if (!imageId) {
    return NextResponse.json(
      { error: "Image id is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("reference_images")
    .delete()
    .eq("id", imageId)
    .eq("session_id", params.sessionId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
