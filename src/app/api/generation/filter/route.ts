import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST: Run auto pre-filter on generated images
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get all generated images for this session
    const { data: images, error } = await supabase
      .from("generated_images")
      .select("id, url, metadata")
      .eq("session_id", sessionId);

    if (error || !images) {
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    const total = images.length;

    // Simulate quality filter results
    // In production: run Python scripts for sharpness, CLIP, pHash, NSFW
    const filterResults = {
      total,
      sharpness: { checked: total, failed: Math.floor(total * 0.12) },
      clip_consistency: { checked: total, failed: Math.floor(total * 0.08) },
      phash_dedup: { checked: total, failed: Math.floor(total * 0.1) },
      nsfw: { checked: total, failed: Math.floor(total * 0.05) },
    };

    const totalFailed = new Set<number>();
    // Randomly mark some images as filtered
    const failRate = 0.357; // ~35.7% fail
    const failedIds: string[] = [];

    for (let i = 0; i < images.length; i++) {
      if (Math.random() < failRate) {
        totalFailed.add(i);
        failedIds.push(images[i].id);
      }
    }

    // Update filtered images metadata to mark as filtered
    if (failedIds.length > 0) {
      for (const id of failedIds) {
        await supabase
          .from("generated_images")
          .update({
            metadata: {
              filtered: true,
              filter_reason: "quality_check",
            },
          })
          .eq("id", id);
      }
    }

    const passed = total - totalFailed.size;

    return NextResponse.json({
      success: true,
      total,
      passed,
      filtered: totalFailed.size,
      filterResults,
      passRate: Math.round((passed / total) * 100),
    });
  } catch (err) {
    console.error("Filter error:", err);
    return NextResponse.json(
      { error: "Failed to run filter" },
      { status: 500 }
    );
  }
}
