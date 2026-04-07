import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Qdrant-based similarity search (falls back to tag-based matching)
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get("id");
  const limit = parseInt(searchParams.get("limit") || "6");

  if (!entryId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Get the source entry
  const { data: source } = await supabase
    .from("character_library")
    .select("*")
    .eq("id", entryId)
    .single();

  if (!source) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  // Try Qdrant vector search if embedding exists
  const qdrantUrl = process.env.QDRANT_URL;
  if (qdrantUrl && source.embedding) {
    try {
      const res = await fetch(`${qdrantUrl}/collections/characters/points/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vector: source.embedding,
          limit: limit + 1, // +1 to exclude self
          with_payload: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const ids = data.result
          .filter((r: { id: string }) => r.id !== entryId)
          .slice(0, limit)
          .map((r: { id: string }) => r.id);

        if (ids.length > 0) {
          const { data: similar } = await supabase
            .from("character_library")
            .select("*, models_3d(*), ip_roster(id, name, universe)")
            .in("id", ids);

          return NextResponse.json(similar ?? []);
        }
      }
    } catch (err) {
      console.warn("Qdrant search failed, falling back to tag-based:", err);
    }
  }

  // Fallback: tag-based similarity
  const tags = (source as Record<string, unknown>).tags as string[];
  if (tags && tags.length > 0) {
    const { data: similar } = await supabase
      .from("character_library")
      .select("*, models_3d(*), ip_roster(id, name, universe)")
      .neq("id", entryId)
      .overlaps("tags", tags)
      .limit(limit);

    return NextResponse.json(similar ?? []);
  }

  return NextResponse.json([]);
}
