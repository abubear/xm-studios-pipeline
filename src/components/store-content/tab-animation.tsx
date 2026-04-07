"use client";

import { useEffect } from "react";
import {
  Play,
  Download,
  Loader2,
  Film,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreContentStore } from "@/hooks/use-store-content-store";
import { useGenerateForTab, useAnalyzeSession } from "@/hooks/use-store-content";
import { WorkflowMonitor } from "./workflow-monitor";
import { useState } from "react";

export function TabAnimation() {
  const {
    sessionId,
    animationSettings,
    setAnimationSettings,
    animationResult,
    setAnimationResult,
    markTabComplete,
    isGenerating,
    generatingTab,
    setGeneratingTab,
    setIsGenerating,
  } = useStoreContentStore();

  const { generateTab } = useGenerateForTab("animation");
  const { data: analysis } = useAnalyzeSession(sessionId);
  const [workflowSteps, setWorkflowSteps] = useState<
    { label: string; status: "pending" | "running" | "complete" | "error"; progress?: number }[]
  >([]);

  const isRunning = generatingTab === "animation";

  // Pre-fill scene description from Claude analysis
  useEffect(() => {
    if (analysis?.sceneDescription && !animationSettings.sceneDescription) {
      setAnimationSettings({ sceneDescription: analysis.sceneDescription });
    }
  }, [analysis, animationSettings.sceneDescription, setAnimationSettings]);

  async function handleGenerate() {
    setGeneratingTab("animation");
    setIsGenerating(true);

    setWorkflowSteps([
      { label: "Analyzing scene description", status: "running", progress: 0 },
      { label: "Preparing Wan2.1 model", status: "pending" },
      { label: "Generating video frames", status: "pending" },
      { label: "Encoding output", status: "pending" },
    ]);

    // Simulate workflow
    for (let i = 0; i < 4; i++) {
      setWorkflowSteps((prev) =>
        prev.map((s, j) =>
          j === i
            ? { ...s, status: "running", progress: 0 }
            : j < i
            ? { ...s, status: "complete", progress: 100 }
            : s
        )
      );
      const duration = [800, 1200, 3000, 1000][i];
      const steps = 10;
      for (let k = 1; k <= steps; k++) {
        await new Promise((r) => setTimeout(r, duration / steps));
        setWorkflowSteps((prev) =>
          prev.map((s, j) =>
            j === i ? { ...s, progress: Math.round((k / steps) * 100) } : s
          )
        );
      }
      setWorkflowSteps((prev) =>
        prev.map((s, j) =>
          j === i ? { ...s, status: "complete", progress: 100 } : s
        )
      );
    }

    try {
      const result = await generateTab(
        animationSettings as unknown as Record<string, unknown>
      );
      if (result) {
        setAnimationResult({
          id: result.id,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          label: "Animated Scene",
          status: "complete",
        });
        markTabComplete("animation");
      }
    } catch {
      setWorkflowSteps((prev) =>
        prev.map((s, i) =>
          i === prev.length - 1 ? { ...s, status: "error" } : s
        )
      );
    } finally {
      setIsGenerating(false);
      setGeneratingTab(null);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Preview */}
      <div className="space-y-4">
        <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
          {animationResult ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={animationResult.url}
                alt="Animation preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                <button className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg text-xs flex items-center gap-1.5">
                  <Play className="w-3 h-3" /> Loop
                </button>
                <div className="flex gap-2">
                  <a
                    href={animationResult.url}
                    download="animation.gif"
                    className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-zinc-900 rounded-lg text-xs font-medium"
                  >
                    GIF
                  </a>
                  <a
                    href={animationResult.url}
                    download="animation.mp4"
                    className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" /> MP4
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Film className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                Animation preview will appear here
              </p>
            </div>
          )}
        </div>

        {/* Hero concept image */}
        <div className="aspect-video bg-zinc-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Hero concept image</p>
          </div>
        </div>

        {isRunning && (
          <WorkflowMonitor steps={workflowSteps} title="Scene Animation" />
        )}
      </div>

      {/* Right: Settings */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Scene Description
            {analysis && (
              <span className="ml-2 text-amber-500 normal-case font-normal">
                <Sparkles className="w-3 h-3 inline" /> AI pre-filled
              </span>
            )}
          </label>
          <textarea
            value={animationSettings.sceneDescription}
            onChange={(e) =>
              setAnimationSettings({ sceneDescription: e.target.value })
            }
            placeholder="Describe the animated scene..."
            rows={4}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus-ring resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Style
          </label>
          <div className="flex gap-2">
            {(["subtle", "moderate", "cinematic"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setAnimationSettings({ style: s })}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors",
                  animationSettings.style === s
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Duration
          </label>
          <div className="flex gap-2">
            {([2, 3, 5] as const).map((d) => (
              <button
                key={d}
                onClick={() => setAnimationSettings({ duration: d })}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium transition-colors",
                  animationSettings.duration === d
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !animationSettings.sceneDescription}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
            isGenerating || !animationSettings.sceneDescription
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              : "bg-amber-500 text-white hover:bg-amber-600"
          )}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Animation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
