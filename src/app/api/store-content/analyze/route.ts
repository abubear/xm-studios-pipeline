import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body as {
      sessionId: string;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required" },
        { status: 400 }
      );
    }

    // Fetch session info for context
    const { data: session } = await supabase
      .from("sessions")
      .select("id, name, ip_roster(name, universe)")
      .eq("id", sessionId)
      .single();

    const sessionData = session as unknown as {
      id: string;
      name: string;
      ip_roster: { name: string; universe: string } | null;
    } | null;

    const characterName = sessionData?.ip_roster?.name || sessionData?.name || "character";
    const universe = sessionData?.ip_roster?.universe || "";

    // Try Claude for scene description + tagline generation
    try {
      const { anthropic } = await import("@/lib/anthropic");

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: `You are a marketing copywriter for XM Studios, a premium collectible statue company. Generate marketing content for statue products.`,
        messages: [
          {
            role: "user",
            content: `Generate marketing content for a premium collectible statue of ${characterName}${universe ? ` from ${universe}` : ""}.

Return a JSON object with:
- "sceneDescription": A vivid 2-sentence description for animating the statue scene (describe the character in action, environment, mood)
- "tagline": A short marketing tagline (under 10 words)
- "features": An array of 4-6 key selling points for the statue (e.g., "Hand-painted polystone", "Limited edition of 999")

Return ONLY valid JSON, no other text.`,
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock?.text) {
        const parsed = JSON.parse(textBlock.text);
        return NextResponse.json(parsed);
      }
    } catch (err) {
      console.warn(
        "Claude API unavailable, using fallback:",
        (err as Error).message
      );
    }

    // Fallback content
    return NextResponse.json({
      sceneDescription: `${characterName} stands in a dramatic pose, energy crackling around their form. The museum-quality statue captures every detail of their iconic appearance${universe ? ` from ${universe}` : ""}.`,
      tagline: `The Definitive ${characterName} Collectible`,
      features: [
        "Premium polystone construction",
        "Hand-painted with exquisite detail",
        "Limited edition collectible",
        `Iconic ${characterName} design`,
        "Museum-quality display piece",
        "Includes certificate of authenticity",
      ],
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    );
  }
}
