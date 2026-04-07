"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Loader2 } from "lucide-react";
import { useJuryStore } from "@/hooks/use-jury-store";

export function ConnectionBanner() {
  const status = useJuryStore((s) => s.connectionStatus);

  if (status === "connected") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-2 text-sm font-medium ${
          status === "disconnected"
            ? "bg-red-500/90 text-white"
            : "bg-amber-500/90 text-zinc-900"
        }`}
      >
        {status === "disconnected" ? (
          <>
            <WifiOff className="w-4 h-4" />
            Connection lost — votes are queued locally
          </>
        ) : (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Reconnecting...
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
