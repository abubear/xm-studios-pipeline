"use client";

import { useState } from "react";
import {
  ZoomIn,
  Download,
  Loader2,
  MousePointerClick,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStoreContentStore,
  CLOSEUP_REGIONS,
  type CloseupRegion,
} from "@/hooks/use-store-content-store";
import { useGenerateForTab } from "@/hooks/use-store-content";
import { WorkflowMonitor } from "./workflow-monitor";

const REGION_POSITIONS: Record<CloseupRegion, { top: string; left: string }> = {
  face: { top: "10%", left: "45%" },
  hands: { top: "50%", left: "25%" },
  base: { top: "85%", left: "50%" },
  accessories: { top: "40%", left: "70%" },
  "back detail": { top: "35%", left: "85%" },
};

export function TabCloseups() {
  const {
    closeups,
    setCloseup,
    markTabComplete,
    isGenerating,
    generatingTab,
    setGeneratingTab,
    setIsGenerating,
  } = useStoreContentStore();

  const { generateTab } = useGenerateForTab("closeups");
  const [activeRegion, setActiveRegion] = useState<CloseupRegion | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<
    { label: string; status: "pending" | "running" | "complete" | "error" }[]
  >([]);

  const isRunning = generatingTab === "closeups";
  const allGenerated = CLOSEUP_REGIONS.every((r) => closeups.has(r));

  async function generateRegion(region: CloseupRegion) {
    setActiveRegion(region);
    setGeneratingTab("closeups");
    setIsGenerating(true);

    try {
      const result = await generateTab({ region });
      if (result) {
        setCloseup(region, {
          id: result.id,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          label: region,
          status: "complete",
        });
      }
    } finally {
      setActiveRegion(null);
      setIsGenerating(false);
      setGeneratingTab(null);
    }
  }

  async function generateAll() {
    setGeneratingTab("closeups");
    setIsGenerating(true);

    const steps = CLOSEUP_REGIONS.map((r) => ({
      label: r,
      status: "pending" as const,
    }));
    setWorkflowSteps(steps);

    for (let i = 0; i < CLOSEUP_REGIONS.length; i++) {
      const region = CLOSEUP_REGIONS[i];
      setWorkflowSteps((prev) =>
        prev.map((s, j) =>
          j === i ? { ...s, status: "running" } : j < i ? { ...s, status: "complete" } : s
        )
      );

      try {
        const result = await generateTab({ region });
        if (result) {
          setCloseup(region, {
            id: result.id,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            label: region,
            status: "complete",
          });
        }
      } catch {
        setWorkflowSteps((prev) =>
          prev.map((s, j) => (j === i ? { ...s, status: "error" } : s))
        );
      }

      setWorkflowSteps((prev) =>
        prev.map((s, j) => (j === i ? { ...s, status: "complete" } : s))
      );
    }

    markTabComplete("closeups");
    setIsGenerating(false);
    setGeneratingTab(null);
  }

  return (
    <div className="space-y-5">
      {/* Actions bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={generateAll}
          disabled={isGenerating}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors",
            isGenerating
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              : "bg-amber-500 text-white hover:bg-amber-600"
          )}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <ZoomIn className="w-3.5 h-3.5" /> Generate All Closeups
            </>
          )}
        </button>

        {allGenerated && (
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white flex items-center gap-2 hover:bg-zinc-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download All
          </button>
        )}
      </div>

      {isRunning && workflowSteps.length > 0 && (
        <WorkflowMonitor steps={workflowSteps} title="AI Crop + 2x Upscale" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero image with clickable regions */}
        <div className="aspect-square bg-zinc-100 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-zinc-300" />
          </div>

          {/* Clickable region hotspots */}
          {CLOSEUP_REGIONS.map((region) => {
            const pos = REGION_POSITIONS[region];
            const isActive = activeRegion === region;
            const hasResult = closeups.has(region);

            return (
              <button
                key={region}
                onClick={() => generateRegion(region)}
                disabled={isGenerating}
                style={{ top: pos.top, left: pos.left }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  hasResult
                    ? "border-green-500 bg-green-500/20"
                    : isActive
                    ? "border-amber-500 bg-amber-500/20"
                    : "border-white/60 bg-white/20 hover:border-amber-400 hover:bg-amber-400/20"
                )}
              >
                {isActive ? (
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                ) : (
                  <MousePointerClick
                    className={cn(
                      "w-4 h-4",
                      hasResult ? "text-green-600" : "text-white"
                    )}
                  />
                )}
              </button>
            );
          })}

          {/* Region labels */}
          {CLOSEUP_REGIONS.map((region) => {
            const pos = REGION_POSITIONS[region];
            return (
              <span
                key={`label-${region}`}
                style={{
                  top: `calc(${pos.top} + 24px)`,
                  left: pos.left,
                }}
                className="absolute -translate-x-1/2 text-[10px] font-medium text-white bg-black/40 px-1.5 py-0.5 rounded capitalize"
              >
                {region}
              </span>
            );
          })}
        </div>

        {/* Closeup results grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Generated Closeups
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {CLOSEUP_REGIONS.map((region) => {
              const result = closeups.get(region);

              return (
                <div
                  key={region}
                  className="bg-zinc-50 rounded-xl overflow-hidden"
                >
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                    {result ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.url}
                        alt={region}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ZoomIn className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  <div className="p-2">
                    <span className="text-xs font-medium text-zinc-600 capitalize">
                      {region}
                    </span>
                    {result && (
                      <span className="text-[10px] text-green-500 ml-2">
                        2x upscaled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
