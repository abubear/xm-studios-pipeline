"use client";

import { useCallback, useRef } from "react";
import {
  Upload,
  X,
  Sparkles,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useImaginationStore,
  STYLE_TAGS,
  type ImageCount,
} from "@/hooks/use-imagination-store";
import { useGenerate } from "@/hooks/use-imagination";

const COUNT_OPTIONS: ImageCount[] = [4, 6, 9];

export function InputPanel() {
  const {
    description,
    setDescription,
    referenceUrl,
    setReferenceUrl,
    selectedTags,
    toggleTag,
    imageCount,
    setImageCount,
    isGenerating,
    currentPrompt,
    setCurrentPrompt,
    promptExpanded,
    togglePromptExpanded,
  } = useImaginationStore();

  const generate = useGenerate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setReferenceUrl(url);
      }
    },
    [setReferenceUrl]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setReferenceUrl(url);
      }
    },
    [setReferenceUrl]
  );

  function handleGenerate() {
    generate.mutate({
      description,
      tags: selectedTags,
      referenceUrl: referenceUrl || undefined,
      count: imageCount,
      existingPrompt: currentPrompt || undefined,
    });
  }

  function handleRegenerate() {
    if (!currentPrompt) return;
    generate.mutate({
      description,
      tags: selectedTags,
      count: imageCount,
      existingPrompt: currentPrompt,
    });
  }

  const canGenerate =
    (description.trim().length > 0 || selectedTags.length > 0) &&
    !isGenerating;

  return (
    <div className="w-1/3 shrink-0 border-r border-zinc-100 flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Reference Image Upload */}
        <div>
          <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Reference Image
          </h3>
          {referenceUrl ? (
            <div className="relative rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={referenceUrl}
                alt="Reference"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setReferenceUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
            >
              <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                Drop an image or click to upload
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                or pick from Scene Composer
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Description
          </h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the statue concept... e.g. Spider-Man crouching on a gargoyle, overlooking the city at night"
            rows={4}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus-ring resize-none"
          />
        </div>

        {/* Style Tags */}
        <div>
          <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Style Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {STYLE_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
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
        </div>

        {/* Count Selector */}
        <div>
          <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Image Count
          </h3>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => setImageCount(count)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-colors",
                  imageCount === count
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Claude Prompt (collapsible) */}
        {currentPrompt && (
          <div>
            <button
              onClick={togglePromptExpanded}
              className="flex items-center gap-2 font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3"
            >
              <Sparkles className="w-3 h-3" />
              AI Prompt
              <span className="text-[10px] normal-case font-normal">
                ({promptExpanded ? "collapse" : "expand"})
              </span>
            </button>
            {promptExpanded && (
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-zinc-800 focus-ring resize-none font-mono"
              />
            )}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={currentPrompt ? handleRegenerate : handleGenerate}
          disabled={!canGenerate}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {currentPrompt ? "Regenerating..." : "Generating..."}
            </>
          ) : currentPrompt ? (
            <>
              <ImageIcon className="w-4 h-4" />
              Regenerate ({imageCount})
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate ({imageCount})
            </>
          )}
        </button>

        {generate.error && (
          <p className="text-xs text-red-500 text-center">
            {generate.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
