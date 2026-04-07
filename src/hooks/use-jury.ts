import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JuryImage, JuryFilter, JurySort } from "@/types/jury";
import { useJuryStore } from "./use-jury-store";

// ── Images ──────────────────────────────────────────
interface ImagesResponse {
  images: JuryImage[];
  total: number;
  voted: number;
}

async function fetchImages(
  sessionId: string,
  filter: JuryFilter,
  sort: JurySort
): Promise<ImagesResponse> {
  const params = new URLSearchParams({ filter, sort });
  const res = await fetch(
    `/api/sessions/${sessionId}/images?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export function useJuryImages(sessionId: string) {
  const filter = useJuryStore((s) => s.filter);
  const sort = useJuryStore((s) => s.sort);

  return useQuery({
    queryKey: ["jury", sessionId, "images", filter, sort],
    queryFn: () => fetchImages(sessionId, filter, sort),
    enabled: !!sessionId,
    staleTime: 10_000,
  });
}

// ── Cast Vote ───────────────────────────────────────
interface VoteResult {
  generated_image_id: string;
  approve_count: number;
  reject_count: number;
  my_vote: "approve" | "reject" | null;
}

async function castVote(
  sessionId: string,
  imageId: string,
  vote: "approve" | "reject"
): Promise<VoteResult> {
  const res = await fetch(`/api/sessions/${sessionId}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generated_image_id: imageId, vote }),
  });
  if (!res.ok) throw new Error("Failed to cast vote");
  return res.json();
}

export function useCastVote(sessionId: string) {
  const queryClient = useQueryClient();
  const pushUndo = useJuryStore((s) => s.pushUndo);

  return useMutation({
    mutationFn: ({
      imageId,
      vote,
    }: {
      imageId: string;
      vote: "approve" | "reject";
    }) => castVote(sessionId, imageId, vote),
    onMutate: async ({ imageId, vote }) => {
      // Optimistic update
      const queryFilter = { queryKey: ["jury", sessionId, "images"], exact: false };
      await queryClient.cancelQueries(queryFilter);

      const queries = queryClient.getQueriesData<ImagesResponse>(queryFilter);

      queries.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<ImagesResponse>(key, {
          ...data,
          images: data.images.map((img) => {
            if (img.id !== imageId) return img;
            const prevVote = img.my_vote;
            pushUndo({ imageId, previousVote: prevVote });
            return {
              ...img,
              my_vote: vote,
              approve_count:
                img.approve_count +
                (vote === "approve" ? 1 : 0) -
                (prevVote === "approve" ? 1 : 0),
              reject_count:
                img.reject_count +
                (vote === "reject" ? 1 : 0) -
                (prevVote === "reject" ? 1 : 0),
            };
          }),
          voted: data.voted + (data.images.find((i) => i.id === imageId)?.my_vote ? 0 : 1),
        });
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["jury", sessionId, "images"],
      });
    },
  });
}

// ── Undo Vote ───────────────────────────────────────
async function undoVote(
  sessionId: string,
  imageId: string
): Promise<VoteResult> {
  const res = await fetch(`/api/sessions/${sessionId}/votes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generated_image_id: imageId }),
  });
  if (!res.ok) throw new Error("Failed to undo vote");
  return res.json();
}

export function useUndoVote(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageId }: { imageId: string }) =>
      undoVote(sessionId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jury", sessionId, "images"],
      });
    },
  });
}

// ── Bulk Approve ────────────────────────────────────
async function bulkApprove(
  sessionId: string,
  imageIds: string[]
): Promise<{ count: number }> {
  const res = await fetch(`/api/sessions/${sessionId}/votes/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generated_image_ids: imageIds, vote: "approve" }),
  });
  if (!res.ok) throw new Error("Failed to bulk approve");
  return res.json();
}

export function useBulkApprove(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: string[]) => bulkApprove(sessionId, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jury", sessionId, "images"],
      });
    },
  });
}

// ── Finalists ───────────────────────────────────────
export function useFinalists(sessionId: string) {
  return useQuery({
    queryKey: ["jury", sessionId, "finalists"],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/finalists`);
      if (!res.ok) throw new Error("Failed to fetch finalists");
      return res.json();
    },
    enabled: !!sessionId,
  });
}

export function usePromoteFinalist(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
      rank,
    }: {
      imageId: string;
      rank?: number;
    }) => {
      const res = await fetch(`/api/sessions/${sessionId}/finalists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generated_image_id: imageId, rank }),
      });
      if (!res.ok) throw new Error("Failed to promote finalist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jury", sessionId, "finalists"],
      });
    },
  });
}
