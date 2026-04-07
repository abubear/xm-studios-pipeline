"use client";

import { useQuery } from "@tanstack/react-query";

export interface ComicVineResult {
  id: number;
  name: string;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    screen_large_url: string;
    small_url: string;
    super_url: string;
    thumb_url: string;
    tiny_url: string;
    original_url: string;
  };
  deck: string | null;
  description: string | null;
  publisher?: { name: string } | null;
  first_appeared_in_issue?: { name: string; issue_number: string } | null;
  issue_number?: string;
  cover_date?: string;
  volume?: { name: string } | null;
  resource_type?: string;
}

interface ComicVineResponse {
  results: ComicVineResult[];
  total: number;
  page: number;
  limit: number;
}

async function searchComicVine(
  query: string,
  resource: string,
  page: number
): Promise<ComicVineResponse> {
  const params = new URLSearchParams({
    query,
    resource,
    page: String(page),
    limit: "20",
  });
  const res = await fetch(`/api/comicvine?${params}`);
  if (!res.ok) throw new Error("Failed to search ComicVine");
  return res.json();
}

export function useComicVineSearch(
  query: string,
  resource: string = "issues",
  page: number = 1
) {
  return useQuery({
    queryKey: ["comicvine", query, resource, page],
    queryFn: () => searchComicVine(query, resource, page),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    placeholderData: (prev) => prev,
  });
}
