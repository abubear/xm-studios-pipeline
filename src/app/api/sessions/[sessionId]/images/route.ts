import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { DEMO_MODE, DEMO_IMAGES } from "@/lib/demo";

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  if (DEMO_MODE) {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all";

    let images = DEMO_IMAGES.map((img) => ({
      ...img,
      session_id: params.sessionId,
    }));

    if (filter === "unvoted") images = images.filter((i) => !i.my_vote);
    else if (filter === "approved") images = images.filter((i) => i.my_vote === "approve");
    else if (filter === "rejected") images = images.filter((i) => i.my_vote === "reject");

    return NextResponse.json({
      images,
      total: DEMO_IMAGES.length,
      voted: DEMO_IMAGES.filter((i) => i.my_vote).length,
    });
  }

  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";
  const sort = url.searchParams.get("sort") || "id";

  const { data: images, error } = await supabase
    .from("generated_images")
    .select("*, votes(user_id, vote)")
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (images ?? []).map((img: Record<string, unknown>) => {
    const votes = (img.votes as { user_id: string; vote: string }[]) || [];
    const approve_count = votes.filter((v) => v.vote === "approve").length;
    const reject_count = votes.filter((v) => v.vote === "reject").length;
    const my_vote = votes.find((v) => v.user_id === user.id)?.vote ?? null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { votes: _voteRel, ...rest } = img;
    return { ...rest, approve_count, reject_count, my_vote };
  });

  let filtered = enriched;
  if (filter === "unvoted") filtered = enriched.filter((i) => !i.my_vote);
  else if (filter === "approved")
    filtered = enriched.filter((i) => i.my_vote === "approve");
  else if (filter === "rejected")
    filtered = enriched.filter((i) => i.my_vote === "reject");

  if (sort === "vote_score") {
    filtered.sort(
      (a, b) =>
        b.approve_count - b.reject_count - (a.approve_count - a.reject_count)
    );
  } else if (sort === "ai_score") {
    filtered.sort((a, b) => {
      const aMeta = (a as Record<string, unknown>).metadata as Record<string, number> | undefined;
      const bMeta = (b as Record<string, unknown>).metadata as Record<string, number> | undefined;
      return (bMeta?.aesthetic_score ?? 0) - (aMeta?.aesthetic_score ?? 0);
    });
  }

  return NextResponse.json({
    images: filtered,
    total: enriched.length,
    voted: enriched.filter((i) => i.my_vote).length,
  });
}
