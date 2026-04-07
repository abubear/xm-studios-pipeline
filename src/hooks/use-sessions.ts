import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session, IPRoster } from "@/types/database";

export type SessionWithIP = Session & {
  ip_roster: Pick<IPRoster, "id" | "name" | "universe" | "thumbnail_url" | "status" | "description"> | null;
};

async function fetchSessions(): Promise<SessionWithIP[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

async function fetchSession(sessionId: string): Promise<SessionWithIP> {
  const res = await fetch(`/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

async function createSession(body: {
  ip_roster_id: string;
  name: string;
}): Promise<SessionWithIP> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create session");
  }
  return res.json();
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: () => fetchSession(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
