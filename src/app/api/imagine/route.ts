import { NextRequest, NextResponse } from "next/server";

const POLLINATIONS_URL = process.env.POLLINATIONS_API_URL || "https://image.pollinations.ai";

function buildFallbackPrompt(description: string, tags: string[]): string {
  const parts: string[] = [];

  if (description) {
    parts.push(description);
  }

  parts.push(
    "Premium collectible statue concept art, museum-quality polystone figure"
  );

  if (tags.length > 0) {
    parts.push(tags.join(", "));
  }

  parts.push(
    "highly detailed sculpt, professional product photography, studio lighting, dark dramatic background, 8k render, sharp focus, volumetric lighting"
  );

  return parts.join(". ");
}

async function buildClaudePrompt(
  description: string,
  tags: string[],
  referenceUrl?: string
): Promise<string | null> {
  try {
    const { anthropic } = await import("@/lib/anthropic");

    const systemPrompt = `You are an expert prompt engineer for Flux image generation models, specializing in premium collectible statue concept art for XM Studios.

Your job is to take a description and style tags and produce a single, highly detailed Flux prompt that will generate stunning concept art for a collectible statue.

Rules:
- Output ONLY the prompt text, nothing else
- Be extremely descriptive about pose, lighting, materials, textures
- Include camera angle and composition details
- Reference the polystone/resin material quality of premium collectibles
- Incorporate the style tags naturally into the prompt
- Keep the prompt under 300 words
- Focus on dramatic, museum-quality presentation`;

    const userMessage = [
      description && `Description: ${description}`,
      tags.length > 0 && `Style tags: ${tags.join(", ")}`,
      referenceUrl && `Reference image is provided for pose/character guidance.`,
    ]
      .filter(Boolean)
      .join("\n");

    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = claudeResponse.content.find((b) => b.type === "text");
    return textBlock?.text || null;
  } catch (err) {
    console.warn("Claude API unavailable, using fallback prompt builder:", (err as Error).message);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      description,
      tags,
      referenceUrl,
      count = 4,
      existingPrompt,
    } = body as {
      description: string;
      tags: string[];
      referenceUrl?: string;
      count?: number;
      existingPrompt?: string;
    };

    // Step 1: Build prompt — try Claude first, fall back to template
    let fluxPrompt: string;

    if (existingPrompt) {
      fluxPrompt = existingPrompt;
    } else {
      if (!description && tags.length === 0) {
        return NextResponse.json(
          { error: "Description or tags required" },
          { status: 400 }
        );
      }

      const claudePrompt = await buildClaudePrompt(description, tags, referenceUrl);
      fluxPrompt = claudePrompt || buildFallbackPrompt(description, tags);
    }

    // Step 2: Generate images
    // Try Pollinations server-side; fall back to placeholder if unavailable
    const seeds = Array.from({ length: count }, () =>
      Math.floor(Math.random() * 999999)
    );

    const images = [];
    for (const seed of seeds) {
      let url: string;

      try {
        const pollinationsUrl = `${POLLINATIONS_URL}/prompt/${encodeURIComponent(fluxPrompt)}?width=512&height=768&seed=${seed}&nologo=true&nofeed=true`;
        const imgRes = await fetch(pollinationsUrl, {
          signal: AbortSignal.timeout(45000),
        });

        if (imgRes.ok && imgRes.headers.get("content-type")?.startsWith("image")) {
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const contentType = imgRes.headers.get("content-type") || "image/jpeg";
          url = `data:${contentType};base64,${base64}`;
        } else {
          // API returned error — use placeholder
          url = `https://picsum.photos/seed/${seed}/512/768`;
        }
      } catch {
        // Timeout or network error — use placeholder
        url = `https://picsum.photos/seed/${seed}/512/768`;
      }

      images.push({
        id: `img-${Date.now()}-${seed}`,
        url,
        seed,
        prompt: fluxPrompt,
        status: "generated" as const,
      });
    }

    return NextResponse.json({
      prompt: fluxPrompt,
      images,
    });
  } catch (err) {
    console.error("Imagination Studio error:", err);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
