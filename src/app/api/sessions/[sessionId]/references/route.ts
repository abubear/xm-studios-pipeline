import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo";

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  if (DEMO_MODE) {
    return NextResponse.json(
      Array.from({ length: 6 }, (_, i) => ({
        id: `demo-ref-${String(i + 1).padStart(3, "0")}`,
        session_id: params.sessionId,
        url: `https://picsum.photos/seed/ref${i + 10}/600/900`,
        source: "comicvine",
        source_id: `demo-${i}`,
        caption: `Reference ${i + 1}`,
        tags: ["marvel", "iron man"],
        width: 600,
        height: 900,
        metadata: {},
        created_by: "demo-user-001",
        created_at: "2026-01-01T00:00:00Z",
      }))
    );
  }
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
  if (DEMO_MODE) {
    const body = await request.json();
    return NextResponse.json(
      { id: `demo-ref-new`, session_id: params.sessionId, ...body, created_at: new Date().toISOString() },
      { status: 201 }
    );
  }
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
  if (DEMO_MODE) return NextResponse.json({ success: true });
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
