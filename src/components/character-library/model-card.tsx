"use client";

import { cn } from "@/lib/utils";
import { Box, Star } from "lucide-react";
import type { LibraryEntryWithRelations } from "@/hooks/use-library";

interface ModelCardProps {
  entry: LibraryEntryWithRelations;
  isSelected: boolean;
  onClick: () => void;
}

export function ModelCard({ entry, isSelected, onClick }: ModelCardProps) {
  const model = entry.models_3d;
  const ip = entry.ip_roster;
  const voteScore =
    typeof (entry.metadata as Record<string, unknown>)?.vote_score === "number"
      ? ((entry.metadata as Record<string, unknown>).vote_score as number)
      : null;

  const polyCount = model?.vertex_count;
  const formatBadge = model?.format?.toUpperCase() || null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all",
        isSelected
          ? "ring-2 ring-amber-500 shadow-md"
          : "hover:shadow-md hover:scale-[1.02]"
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-zinc-100 relative overflow-hidden">
        {entry.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.thumbnail_url}
            alt={entry.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="w-10 h-10 text-zinc-300" />
          </div>
        )}

        {/* IP Badge */}
        {ip && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
            {ip.universe}
          </div>
        )}

        {/* Format Badge */}
        {formatBadge && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/90 rounded text-[10px] font-bold text-white">
            {formatBadge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-zinc-900 truncate">
          {entry.name}
        </h3>

        <div className="flex items-center gap-3 mt-1.5">
          {voteScore !== null && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-500" />
              {voteScore}
            </div>
          )}
          {polyCount && (
            <span className="text-[10px] text-zinc-400">
              {polyCount > 1000000
                ? `${(polyCount / 1000000).toFixed(1)}M`
                : `${(polyCount / 1000).toFixed(0)}k`}{" "}
              polys
            </span>
          )}
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] text-zinc-500"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-[10px] text-zinc-400">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
