"use client";

import { useState } from "react";
import {
  Camera,
  Download,
  RefreshCw,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStoreContentStore,
  CAMERA_ANGLES,
  type CameraAngle,
} from "@/hooks/use-store-content-store";
import { useGenerateForTab } from "@/hooks/use-store-content";
import { WorkflowMonitor } from "./workflow-monitor";

export function TabHeroShots() {
  const {
    heroShotsSettings,
    setHeroShotsSettings,
    heroShots,
    setHeroShot,
    markTabComplete,
    isGenerating,
    generatingTab,
    setGeneratingTab,
    setIsGenerating,
  } = useStoreContentStore();

  const { generateTab } = useGenerateForTab("hero-shots");
  const [generatingAngle, setGeneratingAngle] = useState<CameraAngle | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<
    { label: string; status: "pending" | "running" | "complete" | "error"; progress?: number }[]
  >([]);

  const isRunning = generatingTab === "hero-shots";
  const allGenerated = CAMERA_ANGLES.every((a) => heroShots.has(a));

  async function generateSingle(angle: CameraAngle) {
    setGeneratingAngle(angle);
    setGeneratingTab("hero-shots");
    setIsGenerating(true);

    try {
      const result = await generateTab({
        angle,
        ...heroShotsSettings,
      });
      if (result) {
        setHeroShot(angle, {
          id: result.id,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          label: angle,
          status: "complete",
        });
      }
    } finally {
      setGeneratingAngle(null);
      setIsGenerating(false);
      setGeneratingTab(null);
    }
  }

  async function generateAll() {
    setGeneratingTab("hero-shots");
    setIsGenerating(true);

    const steps = CAMERA_ANGLES.map((a) => ({
      label: a,
      status: "pending" as const,
    }));
    setWorkflowSteps(steps);

    for (let i = 0; i < CAMERA_ANGLES.length; i++) {
      const angle = CAMERA_ANGLES[i];
      setWorkflowSteps((prev) =>
        prev.map((s, j) =>
          j === i ? { ...s, status: "running" } : j < i ? { ...s, status: "complete" } : s
        )
      );

      try {
        const result = await generateTab({
          angle,
          ...heroShotsSettings,
        });
        if (result) {
          setHeroShot(angle, {
            id: result.id,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            label: angle,
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

    markTabComplete("hero-shots");
    setIsGenerating(false);
    setGeneratingTab(null);
  }

  return (
    <div className="space-y-5">
      {/* Settings bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Lighting
          </span>
          {(["studio", "dramatic", "natural"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setHeroShotsSettings({ lighting: l })}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors",
                heroShotsSettings.lighting === l
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Resolution
          </span>
          {([1024, 2048, 4096] as const).map((r) => (
            <button
              key={r}
              onClick={() => setHeroShotsSettings({ resolution: r })}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                heroShotsSettings.resolution === r
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex-1" />

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
              <Camera className="w-3.5 h-3.5" /> Generate All Angles
            </>
          )}
        </button>

        {allGenerated && (
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white flex items-center gap-2 hover:bg-zinc-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download ZIP
          </button>
        )}
      </div>

      {/* Progress */}
      {isRunning && workflowSteps.length > 0 && (
        <WorkflowMonitor steps={workflowSteps} title="Multi-Angle Rendering" />
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CAMERA_ANGLES.map((angle) => {
          const shot = heroShots.get(angle);
          const isAngleGenerating = generatingAngle === angle;

          return (
            <div
              key={angle}
              className="bg-zinc-50 rounded-xl overflow-hidden group"
            >
              <div className="aspect-square bg-zinc-100 relative flex items-center justify-center">
                {shot ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot.url}
                      alt={angle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => generateSingle(angle)}
                        disabled={isGenerating}
                        className="p-2 bg-white rounded-lg text-zinc-700 hover:bg-zinc-100"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : isAngleGenerating ? (
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-300" />
                )}
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600">
                  {angle}
                </span>
                {!shot && !isAngleGenerating && (
                  <button
                    onClick={() => generateSingle(angle)}
                    disabled={isGenerating}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
