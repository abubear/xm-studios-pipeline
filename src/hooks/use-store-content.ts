"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ContentType } from "@/types/database";
import { useStoreContentStore, type ContentTab } from "./use-store-content-store";

// Map tab key to ContentType
const TAB_TO_CONTENT_TYPE: Record<ContentTab, ContentType> = {
  turntable: "turntable_video",
  "hero-shots": "hero_shot",
  closeups: "detail_closeup",
  animation: "animated_gif",
  poster: "preorder_poster",
  package: "content_package",
};

interface GenerateResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  status: string;
  contentType: ContentType;
  metadata?: Record<string, unknown>;
}

interface AnalyzeResponse {
  sceneDescription: string;
  tagline: string;
  features: string[];
}

async function generateContent(body: {
  sessionId: string;
  contentType: ContentType;
  settings: Record<string, unknown>;
}): Promise<GenerateResponse> {
  const res = await fetch("/api/store-content/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Generation failed");
  }
  return res.json();
}

async function analyzeSession(body: {
  sessionId: string;
  imageUrl?: string;
}): Promise<AnalyzeResponse> {
  const res = await fetch("/api/store-content/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
}

export function useGenerate() {
  const { setIsGenerating, setGeneratingTab } =
    useStoreContentStore();

  return useMutation({
    mutationFn: generateContent,
    onMutate: () => {
      setIsGenerating(true);
    },
    onSettled: () => {
      setIsGenerating(false);
      setGeneratingTab(null);
    },
  });
}

export function useGenerateForTab(tab: ContentTab) {
  const generate = useGenerate();
  const { sessionId } = useStoreContentStore();

  return {
    ...generate,
    generateTab: (settings: Record<string, unknown>) => {
      if (!sessionId) return;
      return generate.mutateAsync({
        sessionId,
        contentType: TAB_TO_CONTENT_TYPE[tab],
        settings,
      });
    },
  };
}

export function useAnalyzeSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["store-content-analyze", sessionId],
    queryFn: () => analyzeSession({ sessionId: sessionId! }),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 30, // 30 min cache
  });
}

export { TAB_TO_CONTENT_TYPE };
export type { GenerateResponse, AnalyzeResponse };
