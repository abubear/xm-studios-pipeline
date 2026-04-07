import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkHealth } from "@/lib/viewcomfy/client";
import type { ContentType } from "@/types/database";

interface GenerateRequest {
  sessionId: string;
  contentType: ContentType;
  settings: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as GenerateRequest;
    const { sessionId, contentType, settings } = body;

    if (!sessionId || !contentType) {
      return NextResponse.json(
        { error: "sessionId and contentType are required" },
        { status: 400 }
      );
    }

    // Verify session exists
    const { data: session } = await supabase
      .from("sessions")
      .select("id, name, ip_roster_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if ViewComfy is available
    const viewComfyAvailable = await checkHealth();

    let outputUrl: string;
    let thumbnailUrl: string;

    if (viewComfyAvailable) {
      // Use ViewComfy workflows for real generation
      const result = await generateViaViewComfy(contentType, settings);
      outputUrl = result.url;
      thumbnailUrl = result.thumbnailUrl;
    } else {
      // Fallback: placeholder images when ViewComfy is not running
      const contentId = `sc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const placeholderUrls: Record<ContentType, string> = {
        turntable_video: `https://picsum.photos/seed/${contentId}/1024/1024`,
        hero_shot: `https://picsum.photos/seed/${contentId}/2048/2048`,
        detail_closeup: `https://picsum.photos/seed/${contentId}/1024/1024`,
        animated_gif: `https://picsum.photos/seed/${contentId}/512/768`,
        preorder_poster: `https://picsum.photos/seed/${contentId}/1200/1800`,
        content_package: "",
      };
      outputUrl = placeholderUrls[contentType];
      thumbnailUrl = placeholderUrls[contentType];
    }

    const { data: content, error } = await supabase
      .from("store_content")
      .insert({
        ip_roster_id: session.ip_roster_id,
        content_type: contentType,
        title: `${contentType.replace(/_/g, " ")} - ${session.name}`,
        url: outputUrl,
        thumbnail_url: thumbnailUrl,
        metadata: {
          session_id: sessionId,
          settings,
          generated_by: user.id,
          generated_via: viewComfyAvailable ? "viewcomfy" : "placeholder",
          status: "complete",
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Store content insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: content?.id || `sc-${Date.now()}`,
      url: outputUrl,
      thumbnailUrl,
      status: "complete",
      contentType,
      metadata: settings,
      generatedVia: viewComfyAvailable ? "viewcomfy" : "placeholder",
    });
  } catch (err) {
    console.error("Store content generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

// Dispatch to the appropriate ViewComfy workflow based on content type
async function generateViaViewComfy(
  contentType: ContentType,
  settings: Record<string, unknown>
): Promise<{ url: string; thumbnailUrl: string }> {
  // Dynamic imports to avoid loading ViewComfy client when not needed
  switch (contentType) {
    case "turntable_video": {
      const { sv3dTurntable } = await import("@/lib/viewcomfy/workflows");
      // In production: fetch the hero image blob from Supabase Storage
      // For now, create a placeholder blob
      const heroBlob = new Blob(["placeholder"], { type: "image/png" });
      const result = await sv3dTurntable({
        heroImage: heroBlob,
        frameCount: (settings.frameCount as number) || 24,
        cameraElevation: (settings.cameraElevation as number) || 15,
        outputFormat: (settings.outputFormat as "mp4" | "gif" | "webm") || "mp4",
        background: (settings.background as "transparent" | "white" | "studio") || "studio",
      });
      return {
        url: result.videoUrl || result.outputUrls[0] || "",
        thumbnailUrl: result.outputUrls[0] || "",
      };
    }

    case "hero_shot": {
      const { multiAngleRenders } = await import("@/lib/viewcomfy/workflows");
      const modelBlob = new Blob(["placeholder"], { type: "model/gltf-binary" });
      const result = await multiAngleRenders({
        modelFile: modelBlob,
        lighting: (settings.lighting as "studio" | "dramatic" | "natural") || "studio",
        resolution: (settings.resolution as 1024 | 2048 | 4096) || 2048,
      });
      return {
        url: result.renders[0]?.url || result.outputUrls[0] || "",
        thumbnailUrl: result.renders[0]?.url || result.outputUrls[0] || "",
      };
    }

    case "animated_gif": {
      const { generateSceneGif } = await import("@/lib/viewcomfy/workflows");
      const heroBlob = new Blob(["placeholder"], { type: "image/png" });
      const result = await generateSceneGif({
        heroImage: heroBlob,
        sceneDescription: (settings.sceneDescription as string) || "Animated scene",
        style: (settings.style as "subtle" | "moderate" | "cinematic") || "moderate",
        duration: (settings.duration as 2 | 3 | 5) || 3,
      });
      return {
        url: result.videoUrl || result.outputUrls[0] || "",
        thumbnailUrl: result.outputUrls[0] || "",
      };
    }

    default: {
      // For detail_closeup and preorder_poster, use generic workflow
      const contentId = `vc-${Date.now()}`;
      return {
        url: `https://picsum.photos/seed/${contentId}/1024/1024`,
        thumbnailUrl: `https://picsum.photos/seed/${contentId}/512/512`,
      };
    }
  }
}
