import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST: Compile factory package for Stage 13
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

    // Get IP roster
    const { data: ipRoster } = await supabase
      .from("ip_roster")
      .select("name, universe")
      .eq("id", session.ip_roster_id)
      .single();

    // Get 3D models for this session
    const { data: models } = await supabase
      .from("models_3d")
      .select("id, name, file_url, format, file_size_bytes, is_rigged")
      .eq("session_id", sessionId);

    // Get approved IP submissions
    const { data: submissions } = await supabase
      .from("ip_submissions")
      .select("id, gate_number, status, submission_data")
      .eq("session_id", sessionId)
      .eq("status", "approved");

    // Create factory package record
    const packageContents = {
      stl_files: models
        ?.filter((m) => m.format === "stl" || m.format === "fbx")
        .map((m) => ({
          name: m.name,
          url: m.file_url,
          format: m.format,
          size: m.file_size_bytes,
        })) || [],
      paint_guide: {
        status: "included",
        url: `https://picsum.photos/seed/paint-${sessionId}/1200/1600`,
      },
      assembly_diagram: {
        status: "included",
        url: `https://picsum.photos/seed/assembly-${sessionId}/1200/1600`,
      },
      approval_confirmation: {
        ip_gates_passed: submissions?.length || 0,
        approved_gates: submissions?.map((s) => s.gate_number) || [],
      },
      quality_checklist: {
        surface_finish: "pending",
        joint_tolerance: "pending",
        paint_accuracy: "pending",
        base_stability: "pending",
        packaging_fit: "pending",
      },
    };

    const { data: pkg, error } = await supabase
      .from("factory_packages")
      .insert({
        session_id: sessionId,
        ip_roster_id: session.ip_roster_id,
        name: `${ipRoster?.name || "Character"} Factory Package`,
        status: "pending",
        contents: packageContents,
        notes: `Generated for ${session.name}`,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Factory package error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      packageId: pkg?.id,
      character: ipRoster?.name,
      contents: packageContents,
    });
  } catch (err) {
    console.error("Factory package error:", err);
    return NextResponse.json(
      { error: "Failed to create factory package" },
      { status: 500 }
    );
  }
}

// GET: Get factory package with signed download URLs
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const { data: pkg } = await supabase
      .from("factory_packages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!pkg) {
      return NextResponse.json(
        { error: "No factory package found" },
        { status: 404 }
      );
    }

    // In production: generate signed URLs with 24-hour expiry
    // const { data: signedUrl } = await supabase.storage
    //   .from("factory-packages")
    //   .createSignedUrl(path, 86400);

    return NextResponse.json({
      package: pkg,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  } catch (err) {
    console.error("Factory package GET error:", err);
    return NextResponse.json(
      { error: "Failed to get factory package" },
      { status: 500 }
    );
  }
}
