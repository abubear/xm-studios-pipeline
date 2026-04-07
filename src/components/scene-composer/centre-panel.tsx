"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Plus,
  Check,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useComicVineSearch, type ComicVineResult } from "@/hooks/use-comicvine";
import {
  useSceneComposerStore,
  type SortMode,
  type SelectedImage,
} from "@/hooks/use-scene-composer-store";

const SORT_OPTIONS: { value: SortMode; label: string; icon: typeof Star }[] = [
  { value: "most_iconic", label: "Most Iconic", icon: Star },
  { value: "top_rated", label: "Top Rated", icon: TrendingUp },
  { value: "most_recent", label: "Most Recent", icon: Clock },
];

export function CentrePanel() {
  const {
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    selectedImages,
    addImage,
  } = useSceneComposerStore();
  const [page, setPage] = useState(1);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Sync local input when store query changes (e.g. from character click)
  useEffect(() => {
    setLocalQuery(searchQuery);
    setPage(1);
  }, [searchQuery]);

  const { data, isLoading, isFetching } = useComicVineSearch(
    searchQuery,
    "issues",
    page
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (localQuery.trim().length >= 2) {
      setSearchQuery(localQuery.trim());
      setPage(1);
    }
  }

  function handleAddImage(result: ComicVineResult) {
    const img: SelectedImage = {
      id: `cv-${result.id}`,
      url: result.image?.super_url || result.image?.original_url || "",
      caption:
        result.name +
        (result.issue_number ? ` #${result.issue_number}` : ""),
      source: "comicvine",
      sourceId: String(result.id),
      width: null,
      height: null,
      metadata: {
        volume: result.volume?.name,
        cover_date: result.cover_date,
        issue_number: result.issue_number,
        deck: result.deck,
      },
    };
    addImage(img);
  }

  const isSelected = (id: number) =>
    selectedImages.some((i) => i.id === `cv-${id}`);

  const results = data?.results ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-zinc-100">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for reference images..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus-ring"
          />
        </form>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 mt-3">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  sortMode === opt.value
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                <Icon className="w-3 h-3" />
                {opt.label}
              </button>
            );
          })}

          {total > 0 && (
            <span className="ml-auto text-xs text-zinc-400">
              {total.toLocaleString()} results
            </span>
          )}
        </div>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {!searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">
              Search for a character or select one from the left panel to browse
              reference images.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-zinc-400">
              No results found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {results.map((result) => {
                const selected = isSelected(result.id);
                const imageUrl =
                  result.image?.medium_url || result.image?.thumb_url;
                if (!imageUrl) return null;

                return (
                  <div
                    key={result.id}
                    className={cn(
                      "group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all cursor-pointer",
                      selected
                        ? "ring-2 ring-amber-500 shadow-md"
                        : "hover:shadow-md hover:scale-[1.02]"
                    )}
                    onClick={() => !selected && handleAddImage(result)}
                  >
                    <div className="aspect-[3/4] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={result.name || "Comic reference"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Source Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                        Reference
                      </div>

                      {/* Selected Indicator */}
                      {selected ? (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Plus className="w-5 h-5 text-zinc-700" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5">
                      <p className="text-xs font-medium text-zinc-900 truncate">
                        {result.name}
                        {result.issue_number && ` #${result.issue_number}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {result.volume?.name && (
                          <span className="text-[10px] text-zinc-400 truncate">
                            {result.volume.name}
                          </span>
                        )}
                        {result.cover_date && (
                          <span className="text-[10px] text-zinc-400">
                            {new Date(result.cover_date).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pb-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-zinc-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                {isFetching && (
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin ml-2" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
