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
  const { generated_image_ids, vote } = body as {
    generated_image_ids: string[];
    vote: string;
  };

  if (
    !Array.isArray(generated_image_ids) ||
    generated_image_ids.length === 0 ||
    !["approve", "reject"].includes(vote)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify images belong to session
  const { data: images } = await supabase
    .from("generated_images")
    .select("id")
    .eq("session_id", params.sessionId)
    .in("id", generated_image_ids);

  const validIds = new Set((images ?? []).map((i) => i.id));

  // Get existing votes for this user
  const { data: existingVotes } = await supabase
    .from("votes")
    .select("id, generated_image_id")
    .eq("user_id", user.id)
    .in("generated_image_id", generated_image_ids);

  const existingMap = new Map(
    (existingVotes ?? []).map((v) => [v.generated_image_id, v.id])
  );

  let castCount = 0;

  // Insert new votes
  const toInsert = generated_image_ids
    .filter((id) => validIds.has(id) && !existingMap.has(id))
    .map((id) => ({ generated_image_id: id, user_id: user.id, vote }));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("votes").insert(toInsert);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    castCount += toInsert.length;
  }

  // Update existing votes
  const toUpdate = generated_image_ids.filter(
    (id) => validIds.has(id) && existingMap.has(id)
  );

  for (const imageId of toUpdate) {
    await supabase
      .from("votes")
      .update({ vote })
      .eq("id", existingMap.get(imageId)!);
    castCount++;
  }

  return NextResponse.json({ count: castCount });
}
