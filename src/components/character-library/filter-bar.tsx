"use client";

import { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { IPRoster } from "@/types/database";
import {
  useLibraryStore,
  FORMAT_OPTIONS,
  TAG_OPTIONS,
} from "@/hooks/use-library-store";

export function FilterBar() {
  const {
    search,
    setSearch,
    ipFilter,
    setIpFilter,
    formatFilter,
    setFormatFilter,
    selectedTags,
    toggleTag,
    polyRange,
    setPolyRange,
    minVoteScore,
    setMinVoteScore,
    resetFilters,
  } = useLibraryStore();

  const [ips, setIps] = useState<IPRoster[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("ip_roster")
      .select("*")
      .order("name")
      .then(({ data }) => setIps((data as unknown as IPRoster[]) ?? []));
  }, []);

  return (
    <div className="p-4 border-b border-zinc-100 space-y-4">
      {/* Search + IP Dropdown */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus-ring"
          />
        </div>
        <select
          value={ipFilter ?? ""}
          onChange={(e) => setIpFilter(e.target.value || null)}
          className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-700 focus-ring"
        >
          <option value="">All IP Holders</option>
          {ips.map((ip) => (
            <option key={ip.id} value={ip.id}>
              {ip.name} ({ip.universe})
            </option>
          ))}
        </select>
        <button
          onClick={resetFilters}
          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Format Pills */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
          Format
        </span>
        {FORMAT_OPTIONS.map((fmt) => (
          <button
            key={fmt}
            onClick={() => setFormatFilter(fmt)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
              formatFilter === fmt
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            )}
          >
            {fmt}
          </button>
        ))}
      </div>

      {/* Tag Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
          Tags
        </span>
        {TAG_OPTIONS.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="flex gap-6">
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Max Polygons: {polyRange[1] >= 10000000 ? "Any" : `${(polyRange[1] / 1000).toFixed(0)}k`}
          </label>
          <input
            type="range"
            min={0}
            max={10000000}
            step={100000}
            value={polyRange[1]}
            onChange={(e) => setPolyRange([polyRange[0], parseInt(e.target.value)])}
            className="w-full accent-zinc-900 h-1"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Min Vote Score: {minVoteScore === 0 ? "Any" : minVoteScore}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minVoteScore}
            onChange={(e) => setMinVoteScore(parseInt(e.target.value))}
            className="w-full accent-zinc-900 h-1"
          />
        </div>
      </div>
    </div>
  );
}
