import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useJuryStore } from "./use-jury-store";

export function useJuryRealtime(sessionId: string, imageIds: string[]) {
  const queryClient = useQueryClient();
  const addActivity = useJuryStore((s) => s.addActivity);
  const setConnectionStatus = useJuryStore((s) => s.setConnectionStatus);
  const imageIdSet = useRef(new Set<string>());

  useEffect(() => {
    imageIdSet.current = new Set(imageIds);
  }, [imageIds]);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`jury-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        async (payload) => {
          const record = payload.new as Record<string, string> | null;
          if (!record) return;

          const imageId = record.generated_image_id;
          if (!imageIdSet.current.has(imageId)) return;

          // Fetch voter name
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", record.user_id)
            .single();

          addActivity({
            id: crypto.randomUUID(),
            user_name: (profile as { full_name: string } | null)?.full_name ?? "Someone",
            user_avatar: (profile as { avatar_url: string | null } | null)?.avatar_url ?? null,
            image_id: imageId,
            vote: record.vote as "approve" | "reject",
            timestamp: new Date().toISOString(),
          });

          // Invalidate image data
          queryClient.invalidateQueries({
            queryKey: ["jury", sessionId, "images"],
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "finalists",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["jury", sessionId, "finalists"],
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionStatus("connected");
        else if (status === "CHANNEL_ERROR") setConnectionStatus("disconnected");
        else if (status === "TIMED_OUT") setConnectionStatus("reconnecting");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient, addActivity, setConnectionStatus]);
}
