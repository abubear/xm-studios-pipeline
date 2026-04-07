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

  const { data: images } = await supabase
    .from("generated_images")
    .select("*, votes(vote)")
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: true });

  const { data: finalists } = await supabase
    .from("finalists")
    .select("generated_image_id, rank")
    .eq("session_id", params.sessionId);

  const finalistMap = new Map(
    (finalists ?? []).map((f) => [f.generated_image_id, f.rank])
  );

  const header =
    "image_id,url,prompt,approve_count,reject_count,net_score,is_finalist,rank";
  const rows = (images ?? []).map((img: Record<string, unknown>) => {
    const votes = (img.votes as { vote: string }[]) || [];
    const approves = votes.filter((v) => v.vote === "approve").length;
    const rejects = votes.filter((v) => v.vote === "reject").length;
    const isFinalist = finalistMap.has(img.id as string);
    const rank = finalistMap.get(img.id as string) ?? "";
    const prompt = ((img.prompt as string) ?? "").replace(/"/g, '""');
    return `${img.id},${img.url},"${prompt}",${approves},${rejects},${approves - rejects},${isFinalist},${rank}`;
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="jury-export-${params.sessionId}.csv"`,
    },
  });
}
