import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST: Trigger mass generation via ViewComfy
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
    const { sessionId, batchCount, settings } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get session with master reference
    const { data: session } = await supabase
      .from("sessions")
      .select("id, name, ip_roster_id, config")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get master reference image
    const { data: references } = await supabase
      .from("reference_images")
      .select("id, url, caption")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(1);

    const masterRef = references?.[0];

    // In production: dispatch to ViewComfy qwenMassGeneration
    // For now, generate placeholder images and insert into generated_images
    const count = Math.min(batchCount || 20, 200);
    const images = [];

    for (let i = 0; i < count; i++) {
      const seed = `gen-${sessionId}-${Date.now()}-${i}`;
      images.push({
        session_id: sessionId,
        url: `https://picsum.photos/seed/${seed}/768/1024`,
        thumbnail_url: `https://picsum.photos/seed/${seed}/384/512`,
        prompt: settings?.prompt || `Generated concept ${i + 1}`,
        workflow: "qwen-mass-generation",
        seed: Math.floor(Math.random() * 999999),
        width: 768,
        height: 1024,
        metadata: {
          batch_index: i,
          master_reference: masterRef?.url || null,
          settings,
        },
      });
    }

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const { error } = await supabase.from("generated_images").insert(batch);
      if (error) {
        console.error("Batch insert error:", error);
      } else {
        inserted += batch.length;
      }
    }

    // Update session stage to 3 if not already
    await supabase
      .from("sessions")
      .update({ stage: 3, status: "active" })
      .eq("id", sessionId);

    return NextResponse.json({
      success: true,
      totalGenerated: inserted,
      sessionId,
    });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to start generation" },
      { status: 500 }
    );
  }
}
