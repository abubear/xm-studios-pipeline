"use client";

import { useState, useEffect } from "react";

/** Polls /api/comfyui/health every `intervalMs` to track ViewComfy availability. */
export function useComfyUIStatus(intervalMs = 30_000) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/comfyui/health");
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setConnected(data.connected);
          } else {
            setConnected(false);
          }
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return connected;
}
