"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { IPRoster } from "@/types/database";
import { useSceneComposerStore } from "@/hooks/use-scene-composer-store";

interface LeftPanelProps {
  sessionCharacterName?: string;
}

export function LeftPanel({ sessionCharacterName }: LeftPanelProps) {
  const [ipSearch, setIpSearch] = useState("");
  const [characters, setCharacters] = useState<IPRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useSceneComposerStore();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("ip_roster")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setCharacters((data as unknown as IPRoster[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(ipSearch.toLowerCase()) ||
      c.universe.toLowerCase().includes(ipSearch.toLowerCase())
  );

  function handleCharacterClick(character: IPRoster) {
    setSearchQuery(character.name);
  }

  return (
    <div className="w-80 shrink-0 border-r border-zinc-100 flex flex-col h-full overflow-hidden">
      {/* Character Search */}
      <div className="p-4 border-b border-zinc-100">
        <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Character
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={ipSearch}
            onChange={(e) => setIpSearch(e.target.value)}
            placeholder="Search IP roster..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus-ring"
          />
        </div>
      </div>

      {/* Character List */}
      <div className="flex-1 overflow-y-auto p-2">
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
            const isActive = searchQuery === ip.name;
            const isExpired = ip.status !== "active";
            return (
              <button
                key={ip.id}
                onClick={() => !isExpired && handleCharacterClick(ip)}
                disabled={isExpired}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all text-sm",
                  isExpired && "opacity-40 cursor-not-allowed",
                  isActive
                    ? "bg-amber-50 text-amber-900"
                    : "hover:bg-zinc-50 text-zinc-700"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold",
                    isActive
                      ? "bg-amber-100 text-amber-600"
                      : "bg-zinc-100 text-zinc-500"
                  )}
                >
                  {ip.universe.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{ip.name}</p>
                  <p className="text-xs text-zinc-400">{ip.universe}</p>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Style Guide Section */}
      <div className="p-4 border-t border-zinc-100">
        <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Style Guide
        </h3>
        {sessionCharacterName ? (
          <div className="p-3 bg-zinc-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span className="truncate">{sessionCharacterName} Guide</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Style guide PDF will appear here when available.
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            Select a character to view style guide.
          </p>
        )}
      </div>
    </div>
  );
}
