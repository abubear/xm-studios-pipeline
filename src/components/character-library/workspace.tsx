"use client";

import { useMemo } from "react";
import { Loader2, Library } from "lucide-react";
import { FilterBar } from "./filter-bar";
import { ModelCard } from "./model-card";
import { DetailPanel } from "./detail-panel";
import { useLibraryStore } from "@/hooks/use-library-store";
import { useLibrary } from "@/hooks/use-library";

export function LibraryWorkspace() {
  const {
    search,
    ipFilter,
    formatFilter,
    selectedTags,
    polyRange,
    minVoteScore,
    selectedEntryId,
    setSelectedEntryId,
  } = useLibraryStore();

  const { data: entries, isLoading } = useLibrary({
    search: search || undefined,
    ip_roster_id: ipFilter || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    format: formatFilter || undefined,
  });

  // Client-side filtering for poly count and vote score
  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((entry) => {
      const polyCount = entry.models_3d?.vertex_count;
      if (polyCount && polyRange[1] < 10000000 && polyCount > polyRange[1]) {
        return false;
      }

      const voteScore =
        typeof (entry.metadata as Record<string, unknown>)?.vote_score === "number"
          ? ((entry.metadata as Record<string, unknown>).vote_score as number)
          : 0;
      if (minVoteScore > 0 && voteScore < minVoteScore) {
        return false;
      }

      return true;
    });
  }, [entries, polyRange, minVoteScore]);

  const selectedEntry = selectedEntryId
    ? filtered.find((e) => e.id === selectedEntryId) || null
    : null;

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <FilterBar />

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                <Library className="w-7 h-7 text-zinc-300" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-zinc-900 mb-1">
                No models found
              </h3>
              <p className="text-sm text-zinc-400 max-w-xs">
                {search
                  ? `No results for "${search}". Try adjusting your filters.`
                  : "No models in the library yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((entry) => (
                <ModelCard
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === selectedEntryId}
                  onClick={() =>
                    setSelectedEntryId(
                      entry.id === selectedEntryId ? null : entry.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedEntry && <DetailPanel entry={selectedEntry} />}
    </div>
  );
}
