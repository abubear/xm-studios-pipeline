"use client";

import dynamic from "next/dynamic";
import {
  X,
  Download,
  Search,
  Star,
  Box,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/hooks/use-library-store";
import { useSimilarEntries, type LibraryEntryWithRelations } from "@/hooks/use-library";
import { ModelViewerPlaceholder } from "@/components/3d/model-viewer";

const ModelViewer = dynamic(
  () => import("@/components/3d/model-viewer").then((m) => m.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-zinc-50 rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    ),
  }
);

interface DetailPanelProps {
  entry: LibraryEntryWithRelations;
}

export function DetailPanel({ entry }: DetailPanelProps) {
  const { setSelectedEntryId, detailTab, setDetailTab } = useLibraryStore();
  const { data: similar, isLoading: similarLoading } = useSimilarEntries(
    detailTab === "similar" ? entry.id : null
  );

  const model = entry.models_3d;
  const ip = entry.ip_roster;
  const isGlb = model?.format?.toLowerCase() === "glb" || model?.format?.toLowerCase() === "gltf";
  const voteScore =
    typeof (entry.metadata as Record<string, unknown>)?.vote_score === "number"
      ? ((entry.metadata as Record<string, unknown>).vote_score as number)
      : null;

  const tabs = [
    { key: "info" as const, label: "Info" },
    { key: "formats" as const, label: "Formats" },
    { key: "history" as const, label: "History" },
    { key: "similar" as const, label: "Similar" },
  ];

  return (
    <div className="w-96 shrink-0 border-l border-zinc-100 flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <h3 className="font-heading text-sm font-semibold text-zinc-900 truncate">
          {entry.name}
        </h3>
        <button
          onClick={() => setSelectedEntryId(null)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Viewer */}
      <div className="p-4">
        {isGlb && model?.file_url ? (
          <ModelViewer url={model.file_url} className="aspect-square" />
        ) : (
          <ModelViewerPlaceholder className="aspect-square" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setDetailTab(tab.key)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors border-b-2",
              detailTab === tab.key
                ? "text-zinc-900 border-zinc-900"
                : "text-zinc-400 border-transparent hover:text-zinc-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailTab === "info" && (
          <div className="space-y-4">
            {ip && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                  {ip.universe}
                </span>
                <span className="text-xs text-zinc-400">{ip.name}</span>
              </div>
            )}

            {entry.description && (
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-zinc-600">{entry.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {voteScore !== null && (
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] text-zinc-400 uppercase">
                      Vote Score
                    </span>
                  </div>
                  <p className="text-lg font-bold text-zinc-900">
                    {voteScore}
                  </p>
                </div>
              )}
              {model?.vertex_count && (
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Box className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] text-zinc-400 uppercase">
                      Polygons
                    </span>
                  </div>
                  <p className="text-lg font-bold text-zinc-900">
                    {model.vertex_count > 1000000
                      ? `${(model.vertex_count / 1000000).toFixed(1)}M`
                      : `${(model.vertex_count / 1000).toFixed(0)}k`}
                  </p>
                </div>
              )}
            </div>

            {entry.tags.length > 0 && (
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">
                  Tags
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-zinc-100 rounded-lg text-xs text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.sketchfab_url && (
              <a
                href={entry.sketchfab_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-amber-600 hover:text-amber-700"
              >
                View 3D Model &rarr;
              </a>
            )}
          </div>
        )}

        {detailTab === "formats" && (
          <div className="space-y-3">
            {model ? (
              <div className="p-3 bg-zinc-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {model.format?.toUpperCase()}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {model.file_size_bytes
                      ? `${(model.file_size_bytes / 1024 / 1024).toFixed(1)} MB`
                      : "Size unknown"}
                  </p>
                </div>
                <a
                  href={model.file_url}
                  download
                  className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-8">
                No model files available
              </p>
            )}
          </div>
        )}

        {detailTab === "history" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar className="w-3 h-3" />
              Created {new Date(entry.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <FileText className="w-3 h-3" />
              Updated {new Date(entry.updated_at).toLocaleDateString()}
            </div>
            {model?.is_rigged && (
              <div className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs inline-block">
                Rigged
              </div>
            )}
          </div>
        )}

        {detailTab === "similar" && (
          <div className="space-y-3">
            <button
              onClick={() => setDetailTab("similar")}
              className="w-full py-2 bg-zinc-900 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2"
            >
              <Search className="w-3 h-3" />
              Find Similar
            </button>

            {similarLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              </div>
            )}

            {similar && similar.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-4">
                No similar models found
              </p>
            )}

            {similar && similar.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {similar.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedEntryId(s.id)}
                    className="bg-zinc-50 rounded-xl overflow-hidden text-left hover:bg-zinc-100 transition-colors"
                  >
                    <div className="aspect-square bg-zinc-100">
                      {s.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.thumbnail_url}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-6 h-6 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-zinc-700 p-2 truncate">
                      {s.name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
