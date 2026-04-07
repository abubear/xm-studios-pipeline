import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

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
  const { generated_image_id, vote } = body;

  if (!generated_image_id || !["approve", "reject"].includes(vote)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify image belongs to session
  const { data: image } = await supabase
    .from("generated_images")
    .select("id")
    .eq("id", generated_image_id)
    .eq("session_id", params.sessionId)
    .single();

  if (!image)
    return NextResponse.json({ error: "Image not found" }, { status: 404 });

  // Upsert vote
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("generated_image_id", generated_image_id)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    const { error } = await supabase
      .from("votes")
      .update({ vote })
      .eq("id", existingVote.id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ generated_image_id, user_id: user.id, vote });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return updated counts
  const { data: votes } = await supabase
    .from("votes")
    .select("vote")
    .eq("generated_image_id", generated_image_id);

  const approve_count = (votes ?? []).filter((v) => v.vote === "approve").length;
  const reject_count = (votes ?? []).filter((v) => v.vote === "reject").length;

  return NextResponse.json({
    generated_image_id,
    approve_count,
    reject_count,
    my_vote: vote,
  });
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
  const { generated_image_id } = body;

  // Verify image belongs to session
  const { data: image } = await supabase
    .from("generated_images")
    .select("id")
    .eq("id", generated_image_id)
    .eq("session_id", params.sessionId)
    .single();

  if (!image)
    return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("generated_image_id", generated_image_id)
    .eq("user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Return updated counts
  const { data: votes } = await supabase
    .from("votes")
    .select("vote")
    .eq("generated_image_id", generated_image_id);

  const approve_count = (votes ?? []).filter((v) => v.vote === "approve").length;
  const reject_count = (votes ?? []).filter((v) => v.vote === "reject").length;

  return NextResponse.json({
    generated_image_id,
    approve_count,
    reject_count,
    my_vote: null,
  });
}
