"use client";

import { useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  Copy,
  ChevronDown,
  Loader2,
  Sparkles,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useImaginationStore, type GeneratedImage } from "@/hooks/use-imagination-store";
import { useGenerate } from "@/hooks/use-imagination";

export function ResultsPanel() {
  const {
    currentResults,
    updateImageStatus,
    isGenerating,
    description,
    selectedTags,
    history,
  } = useImaginationStore();
  const generate = useGenerate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const approvedImages = currentResults.filter(
    (img) => img.status === "approved"
  );

  function handleRegenSingle(image: GeneratedImage) {
    generate.mutate({
      description,
      tags: selectedTags,
      count: 1,
      existingPrompt: image.prompt,
    });
  }

  async function handleCopyPrompt(prompt: string, id: string) {
    await navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const gridCols =
    currentResults.length <= 4
      ? "grid-cols-2"
      : currentResults.length <= 6
        ? "grid-cols-3"
        : "grid-cols-3";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentResults.length === 0 && !isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-zinc-900 mb-2">
              Ready to Create
            </h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              Add a description and style tags, then hit Generate to create
              concept art with AI-powered generation.
            </p>
          </div>
        ) : isGenerating && currentResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-sm text-zinc-500">
              Crafting your prompt...
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-4", gridCols)}>
            {currentResults.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "relative group bg-white rounded-2xl shadow-sm overflow-hidden transition-all",
                  image.status === "approved" &&
                    "ring-2 ring-emerald-400",
                  image.status === "rejected" && "opacity-40"
                )}
                onMouseEnter={() => setHoveredId(image.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="aspect-[3/4] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt="Generated concept"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Status Badge */}
                  {image.status === "approved" && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 rounded text-[10px] font-medium text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Approved
                    </div>
                  )}
                  {image.status === "rejected" && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 rounded text-[10px] font-medium text-white flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Rejected
                    </div>
                  )}

                  {/* Hover Overlay */}
                  {hoveredId === image.id && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 p-4">
                      {/* Prompt Preview */}
                      <p className="text-[10px] text-white/80 text-center line-clamp-3 mb-2">
                        {image.prompt}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {image.status !== "approved" && (
                          <button
                            onClick={() =>
                              updateImageStatus(image.id, "approved")
                            }
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {image.status !== "rejected" && (
                          <button
                            onClick={() =>
                              updateImageStatus(image.id, "rejected")
                            }
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRegenSingle(image)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                          title="Regenerate (new seed)"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleCopyPrompt(image.prompt, image.id)
                          }
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                          title="Copy prompt"
                        >
                          {copiedId === image.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Reset status */}
                      {image.status !== "generated" && (
                        <button
                          onClick={() =>
                            updateImageStatus(image.id, "generated")
                          }
                          className="text-[10px] text-white/60 hover:text-white transition-colors mt-1"
                        >
                          Reset status
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    Seed: {image.seed}
                  </span>
                  {image.status === "generated" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          updateImageStatus(image.id, "approved")
                        }
                        className="p-1 text-zinc-300 hover:text-emerald-500 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateImageStatus(image.id, "rejected")
                        }
                        className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3"
            >
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  showHistory && "rotate-180"
                )}
              />
              History ({history.length})
            </button>
            {showHistory && (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-600"
                  >
                    <p className="truncate font-mono">{entry.prompt}</p>
                    <p className="text-zinc-400 mt-1">
                      {entry.images.length} images &middot;{" "}
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Bar */}
      {approvedImages.length > 0 && (
        <div className="border-t border-zinc-100 bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {approvedImages.slice(0, 5).map((img) => (
                <div
                  key={img.id}
                  className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="Approved"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {approvedImages.length > 5 && (
                <div className="w-10 h-10 rounded-lg bg-zinc-100 ring-2 ring-white flex items-center justify-center text-xs font-medium text-zinc-500">
                  +{approvedImages.length - 5}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">
                {approvedImages.length} approved
              </p>
              <p className="text-xs text-zinc-400">
                Ready to send to pipeline
              </p>
            </div>
            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send to Pipeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
