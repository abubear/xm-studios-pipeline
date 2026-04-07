"use client";

import { useMutation } from "@tanstack/react-query";
import {
  useImaginationStore,
  type GeneratedImage,
} from "./use-imagination-store";

interface GenerateRequest {
  description: string;
  tags: string[];
  referenceUrl?: string;
  count?: number;
  existingPrompt?: string;
}

interface GenerateResponse {
  prompt: string;
  images: GeneratedImage[];
}

async function generateImages(
  body: GenerateRequest
): Promise<GenerateResponse> {
  const res = await fetch("/api/imagine", {
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

export function useGenerate() {
  const {
    setIsGenerating,
    setCurrentPrompt,
    setCurrentResults,
    addToHistory,
  } = useImaginationStore();

  return useMutation({
    mutationFn: generateImages,
    onMutate: () => {
      setIsGenerating(true);
    },
    onSuccess: (data) => {
      setCurrentPrompt(data.prompt);
      setCurrentResults(data.images);
      addToHistory({
        prompt: data.prompt,
        images: data.images,
        timestamp: Date.now(),
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });
}
