import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";
  const sort = url.searchParams.get("sort") || "id";

  // Fetch images with their votes
  const { data: images, error } = await supabase
    .from("generated_images")
    .select("*, votes(user_id, vote)")
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform to include vote counts and user's vote
  const enriched = (images ?? []).map((img: Record<string, unknown>) => {
    const votes = (img.votes as { user_id: string; vote: string }[]) || [];
    const approve_count = votes.filter((v) => v.vote === "approve").length;
    const reject_count = votes.filter((v) => v.vote === "reject").length;
    const my_vote =
      votes.find((v) => v.user_id === user.id)?.vote ?? null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { votes: _voteRel, ...rest } = img;
    return { ...rest, approve_count, reject_count, my_vote };
  });

  // Apply filter
  let filtered = enriched;
  if (filter === "unvoted") filtered = enriched.filter((i) => !i.my_vote);
  else if (filter === "approved")
    filtered = enriched.filter((i) => i.my_vote === "approve");
  else if (filter === "rejected")
    filtered = enriched.filter((i) => i.my_vote === "reject");

  // Apply sort
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
