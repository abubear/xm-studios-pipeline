"use client";

import { useQuery } from "@tanstack/react-query";
import type { CharacterLibraryEntry, Model3D, IPRoster } from "@/types/database";

export type LibraryEntryWithRelations = CharacterLibraryEntry & {
  models_3d: Model3D | null;
  ip_roster: Pick<IPRoster, "id" | "name" | "universe"> | null;
};

async function fetchLibrary(params: {
  search?: string;
  ip_roster_id?: string;
  tags?: string[];
  format?: string;
}): Promise<LibraryEntryWithRelations[]> {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.ip_roster_id) sp.set("ip_roster_id", params.ip_roster_id);
  if (params.tags && params.tags.length > 0) sp.set("tags", params.tags.join(","));
  if (params.format) sp.set("format", params.format);

  const res = await fetch(`/api/library?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch library");
  return res.json();
}

async function fetchSimilar(id: string): Promise<LibraryEntryWithRelations[]> {
  const res = await fetch(`/api/library/similar?id=${id}&limit=6`);
  if (!res.ok) throw new Error("Failed to fetch similar");
  return res.json();
}

export function useLibrary(params: {
  search?: string;
  ip_roster_id?: string;
  tags?: string[];
  format?: string;
}) {
  return useQuery({
    queryKey: ["library", params],
    queryFn: () => fetchLibrary(params),
    placeholderData: (prev) => prev,
  });
}

export function useSimilarEntries(id: string | null) {
  return useQuery({
    queryKey: ["library-similar", id],
    queryFn: () => fetchSimilar(id!),
    enabled: !!id,
  });
}
