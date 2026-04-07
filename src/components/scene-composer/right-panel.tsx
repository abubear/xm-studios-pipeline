"use client";

import { useState, useCallback } from "react";
import {
  Star,
  X,
  GripVertical,
  Package,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSceneComposerStore } from "@/hooks/use-scene-composer-store";
import { useAddReference } from "@/hooks/use-references";

interface RightPanelProps {
  sessionId: string;
}

export function RightPanel({ sessionId }: RightPanelProps) {
  const {
    selectedImages,
    removeImage,
    reorderImages,
    masterReferenceId,
    setMasterReference,
    clearImages,
  } = useSceneComposerStore();
  const addReference = useAddReference(sessionId);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== toIndex) {
        reorderImages(dragIndex, toIndex);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, reorderImages]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  async function handleExport() {
    if (selectedImages.length === 0) return;
    setExporting(true);
    try {
      for (const img of selectedImages) {
        await addReference.mutateAsync({
          url: img.url,
          source: img.source,
          source_id: img.sourceId || undefined,
          caption: img.caption,
          tags:
            img.id === masterReferenceId ? ["master_reference"] : [],
          width: img.width || undefined,
          height: img.height || undefined,
          metadata: {
            ...img.metadata,
            is_master: img.id === masterReferenceId,
            order: selectedImages.indexOf(img),
          },
        });
      }
      clearImages();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  const masterImage = selectedImages.find((i) => i.id === masterReferenceId);

  return (
    <div className="w-80 shrink-0 border-l border-zinc-100 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Selected ({selectedImages.length}/8)
          </h3>
          {selectedImages.length > 0 && (
            <button
              onClick={clearImages}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Master Reference Preview */}
      {masterImage && (
        <div className="p-4 border-b border-zinc-100">
          <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-amber-500" />
            Master Reference
          </p>
          <div className="aspect-[4/3] rounded-xl overflow-hidden ring-2 ring-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={masterImage.url}
              alt={masterImage.caption}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2 truncate">
            {masterImage.caption}
          </p>
        </div>
      )}

      {/* Image Basket */}
      <div className="flex-1 overflow-y-auto p-2">
        {selectedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-xs text-zinc-400">
              Click images in the grid to add them to your selection. You can
              select up to 8 references.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {selectedImages.map((img, index) => {
              const isMaster = img.id === masterReferenceId;
              return (
                <div
                  key={img.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl transition-all cursor-grab active:cursor-grabbing",
                    dragOverIndex === index && "bg-amber-50",
                    dragIndex === index && "opacity-40",
                    isMaster
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-zinc-50 hover:bg-zinc-100"
                  )}
                >
                  <GripVertical className="w-4 h-4 text-zinc-300 shrink-0" />
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-700 truncate">
                      {img.caption}
                    </p>
                    <p className="text-[10px] text-zinc-400">{img.source}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setMasterReference(img.id)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        isMaster
                          ? "text-amber-500"
                          : "text-zinc-300 hover:text-amber-500"
                      )}
                      title="Set as master reference"
                    >
                      <Star
                        className={cn(
                          "w-3.5 h-3.5",
                          isMaster && "fill-amber-500"
                        )}
                      />
                    </button>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1 rounded text-zinc-300 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={handleExport}
          disabled={selectedImages.length === 0 || exporting}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              Export to Stage 03
            </>
          )}
        </button>
        {selectedImages.length > 0 && !masterReferenceId && (
          <p className="text-[10px] text-amber-600 text-center mt-2">
            No master reference set. The first image will be used.
          </p>
        )}
      </div>
    </div>
  );
}
