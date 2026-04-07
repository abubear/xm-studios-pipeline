"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReferenceImage } from "@/types/database";

async function fetchReferences(sessionId: string): Promise<ReferenceImage[]> {
  const res = await fetch(`/api/sessions/${sessionId}/references`);
  if (!res.ok) throw new Error("Failed to fetch references");
  return res.json();
}

async function addReference(
  sessionId: string,
  body: {
    url: string;
    source: string;
    source_id?: string;
    caption?: string;
    tags?: string[];
    width?: number;
    height?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<ReferenceImage> {
  const res = await fetch(`/api/sessions/${sessionId}/references`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add reference");
  }
  return res.json();
}

async function deleteReference(
  sessionId: string,
  imageId: string
): Promise<void> {
  const res = await fetch(
    `/api/sessions/${sessionId}/references?id=${imageId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete reference");
}

export function useReferenceImages(sessionId: string) {
  return useQuery({
    queryKey: ["references", sessionId],
    queryFn: () => fetchReferences(sessionId),
    enabled: !!sessionId,
  });
}

export function useAddReference(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      url: string;
      source: string;
      source_id?: string;
      caption?: string;
      tags?: string[];
      width?: number;
      height?: number;
      metadata?: Record<string, unknown>;
    }) => addReference(sessionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references", sessionId] });
    },
  });
}

export function useDeleteReference(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteReference(sessionId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references", sessionId] });
    },
  });
}
