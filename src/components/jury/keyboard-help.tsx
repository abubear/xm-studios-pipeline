"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useJuryStore } from "@/hooks/use-jury-store";

const shortcuts = [
  { key: "A", action: "Approve (expanded only)" },
  { key: "R", action: "Reject (expanded only)" },
  { key: "Space", action: "Skip to next image" },
  { key: "← / →", action: "Navigate images" },
  { key: "Z", action: "Undo last vote" },
  { key: "Esc", action: "Close expanded view" },
  { key: "?", action: "Toggle this help panel" },
];

export function KeyboardHelp() {
  const helpOpen = useJuryStore((s) => s.helpOpen);
  const toggleHelp = useJuryStore((s) => s.toggleHelp);

  return (
    <AnimatePresence>
      {helpOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-6 right-6 z-50 w-72 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-900">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={toggleHelp}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-1.5">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between py-1"
              >
                <span className="text-xs text-zinc-500">{s.action}</span>
                <kbd className="px-2 py-0.5 text-[11px] font-mono bg-zinc-100 border border-zinc-200 rounded text-zinc-600 min-w-[28px] text-center">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
