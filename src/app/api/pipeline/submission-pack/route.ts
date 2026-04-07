import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST: Generate submission pack PDF for IP Gate 1
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

    // Get session details
    const { data: session } = await supabase
      .from("sessions")
      .select("id, name, ip_roster_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get IP roster details
    const { data: ipRoster } = await supabase
      .from("ip_roster")
      .select("name, universe")
      .eq("id", session.ip_roster_id)
      .single();

    // Get finalists (top 20 images)
    const { data: finalists } = await supabase
      .from("finalists")
      .select("id, rank, generated_image_id, notes")
      .eq("session_id", sessionId)
      .order("rank", { ascending: true })
      .limit(20);

    // Get finalist images
    const finalistImageIds =
      finalists?.map((f) => f.generated_image_id) || [];
    const { data: images } = await supabase
      .from("generated_images")
      .select("id, url, prompt")
      .in("id", finalistImageIds.length > 0 ? finalistImageIds : ["none"]);

    // Create IP submission record
    const { data: submission, error } = await supabase
      .from("ip_submissions")
      .insert({
        session_id: sessionId,
        ip_roster_id: session.ip_roster_id,
        gate_number: 1,
        status: "pending",
        submission_data: {
          session_name: session.name,
          character: ipRoster?.name || "Unknown",
          universe: ipRoster?.universe || "Unknown",
          finalist_count: finalists?.length || 0,
          finalist_images: images?.map((img) => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt,
          })),
          generated_at: new Date().toISOString(),
          generated_by: user.id,
        },
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Submission insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: submission?.id,
      finalistCount: finalists?.length || 0,
      character: ipRoster?.name,
      universe: ipRoster?.universe,
    });
  } catch (err) {
    console.error("Submission pack error:", err);
    return NextResponse.json(
      { error: "Failed to generate submission pack" },
      { status: 500 }
    );
  }
}
