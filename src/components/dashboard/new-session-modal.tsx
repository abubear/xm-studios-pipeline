"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useCreateSession } from "@/hooks/use-sessions";
import type { IPRoster } from "@/types/database";

interface NewSessionModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewSessionModal({ open, onClose }: NewSessionModalProps) {
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState<IPRoster[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIP, setSelectedIP] = useState<IPRoster | null>(null);
  const [sessionName, setSessionName] = useState("");
  const createSession = useCreateSession();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("ip_roster")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setCharacters((data as unknown as IPRoster[]) ?? []);
        setLoading(false);
      });
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIP(null);
      setSessionName("");
      createSession.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.universe.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    if (!selectedIP || !sessionName.trim()) return;

    try {
      await createSession.mutateAsync({
        ip_roster_id: selectedIP.id,
        name: sessionName.trim(),
      });
      onClose();
    } catch {
      // error is in createSession.error
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h2 className="font-heading text-lg font-semibold text-zinc-900">
                  New Production Session
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {!selectedIP ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search characters..."
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-ring"
                      />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                        </div>
                      ) : filtered.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-8">
                          No characters found
                        </p>
                      ) : (
                        filtered.map((ip) => {
                          const isExpired = ip.status !== "active";
                          return (
                            <button
                              key={ip.id}
                              onClick={() => {
                                if (!isExpired) {
                                  setSelectedIP(ip);
                                  setSessionName(
                                    `${ip.name} — Session ${new Date().toLocaleDateString("en-SG", { month: "short", year: "numeric" })}`
                                  );
                                }
                              }}
                              disabled={isExpired}
                              className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors",
                                isExpired
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-zinc-50"
                              )}
                            >
                              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-500">
                                {ip.universe.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-zinc-900 truncate">
                                  {ip.name}
                                </p>
                                <p className="text-xs text-zinc-400">
                                  {ip.universe}
                                </p>
                              </div>
                              {isExpired && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded text-red-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span className="text-[10px] font-medium">
                                    Licence expired
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-500">
                        {selectedIP.universe.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900">
                          {selectedIP.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {selectedIP.universe}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedIP(null)}
                        className="ml-auto text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-2">
                        Session Name
                      </label>
                      <input
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="e.g. Spider-Man Dynamic Pose v1"
                        autoFocus
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-ring"
                      />
                    </div>

                    {createSession.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-sm text-red-600">
                          {createSession.error.message}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={
                          !sessionName.trim() || createSession.isPending
                        }
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        {createSession.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Session"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
