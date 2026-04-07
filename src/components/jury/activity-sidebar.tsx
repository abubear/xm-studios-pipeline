"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useJuryStore } from "@/hooks/use-jury-store";
import { formatDistanceToNow } from "date-fns";

export function ActivitySidebar() {
  const activityOpen = useJuryStore((s) => s.activityOpen);
  const toggleActivity = useJuryStore((s) => s.toggleActivity);
  const activityFeed = useJuryStore((s) => s.activityFeed);

  return (
    <AnimatePresence>
      {activityOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleActivity}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-screen w-80 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="font-heading text-sm font-semibold text-zinc-200">
                Team Activity
              </h3>
              <button
                onClick={toggleActivity}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activityFeed.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-600">
                    No activity yet
                  </p>
                  <p className="text-xs text-zinc-700 mt-1">
                    Votes will appear here in real-time
                  </p>
                </div>
              ) : (
                activityFeed.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/40"
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-zinc-300">
                      {event.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-300">
                        <span className="font-medium">{event.user_name}</span>
                        {" "}
                        <span
                          className={
                            event.vote === "approve"
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {event.vote === "approve" ? "approved" : "rejected"}
                        </span>
                        {" "}
                        <span className="text-zinc-500 font-mono">
                          #{event.image_id.slice(0, 6)}
                        </span>
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {formatDistanceToNow(new Date(event.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        event.vote === "approve"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {event.vote === "approve" ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
