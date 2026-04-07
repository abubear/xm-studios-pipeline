"use client";

import { useEffect } from "react";
import {
  Download,
  Loader2,
  FileImage,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreContentStore } from "@/hooks/use-store-content-store";
import { useGenerateForTab, useAnalyzeSession } from "@/hooks/use-store-content";
import { WorkflowMonitor } from "./workflow-monitor";
import { useState } from "react";

export function TabPoster() {
  const {
    sessionId,
    posterSettings,
    setPosterSettings,
    posterResult,
    setPosterResult,
    markTabComplete,
    isGenerating,
    generatingTab,
    setGeneratingTab,
    setIsGenerating,
  } = useStoreContentStore();

  const { generateTab } = useGenerateForTab("poster");
  const { data: analysis } = useAnalyzeSession(sessionId);
  const [workflowSteps, setWorkflowSteps] = useState<
    { label: string; status: "pending" | "running" | "complete" | "error"; progress?: number }[]
  >([]);

  const isRunning = generatingTab === "poster";

  // Pre-fill from Claude analysis
  useEffect(() => {
    if (analysis) {
      if (analysis.tagline && !posterSettings.tagline) {
        setPosterSettings({ tagline: analysis.tagline });
      }
      if (analysis.features && posterSettings.features.length === 0) {
        setPosterSettings({ features: analysis.features });
      }
    }
  }, [analysis, posterSettings.tagline, posterSettings.features.length, setPosterSettings]);

  async function handleGenerate() {
    setGeneratingTab("poster");
    setIsGenerating(true);

    setWorkflowSteps([
      { label: "Composing layout", status: "running", progress: 0 },
      { label: "Rendering hero image", status: "pending" },
      { label: "Adding text overlays", status: "pending" },
      { label: "Exporting high-res", status: "pending" },
    ]);

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
      const duration = [1000, 2000, 1500, 1000][i];
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
        posterSettings as unknown as Record<string, unknown>
      );
      if (result) {
        setPosterResult({
          id: result.id,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          label: "Pre-Order Poster",
          status: "complete",
        });
        markTabComplete("poster");
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
      {/* Left: Canvas preview */}
      <div className="space-y-4">
        <div
          className={cn(
            "aspect-[2/3] rounded-2xl overflow-hidden flex items-center justify-center relative",
            posterSettings.background === "dark-gradient"
              ? "bg-gradient-to-b from-zinc-800 to-zinc-950"
              : posterSettings.background === "clean-white"
              ? "bg-white border border-zinc-200"
              : "bg-gradient-to-b from-amber-900/30 to-zinc-900"
          )}
        >
          {posterResult ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterResult.url}
                alt="Poster preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <a
                  href={posterResult.url}
                  download="poster.png"
                  className="px-3 py-1.5 bg-white/80 text-zinc-900 rounded-lg text-xs font-medium"
                >
                  PNG
                </a>
                <a
                  href={posterResult.url}
                  download="poster.pdf"
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" /> PDF
                </a>
              </div>
            </>
          ) : (
            <div className="text-center px-8">
              {/* Mock poster layout */}
              <div className="w-24 h-24 bg-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <ImageIcon
                  className={cn(
                    "w-10 h-10",
                    posterSettings.background === "clean-white"
                      ? "text-zinc-300"
                      : "text-white/30"
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-lg font-heading font-bold mb-2",
                  posterSettings.background === "clean-white"
                    ? "text-zinc-900"
                    : "text-white"
                )}
              >
                {posterSettings.tagline || "Your Tagline Here"}
              </p>
              {posterSettings.features.length > 0 && (
                <div className="space-y-1">
                  {posterSettings.features.slice(0, 3).map((f, i) => (
                    <p
                      key={i}
                      className={cn(
                        "text-xs",
                        posterSettings.background === "clean-white"
                          ? "text-zinc-500"
                          : "text-white/60"
                      )}
                    >
                      {f}
                    </p>
                  ))}
                </div>
              )}
              {/* Thumbnail slots */}
              <div className="flex gap-2 justify-center mt-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={cn(
                      "w-12 h-12 rounded-lg",
                      posterSettings.background === "clean-white"
                        ? "bg-zinc-100"
                        : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {isRunning && (
          <WorkflowMonitor steps={workflowSteps} title="Poster Generation" />
        )}
      </div>

      {/* Right: Settings */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Background
          </label>
          <div className="flex gap-2">
            {(
              [
                { key: "dark-gradient" as const, label: "Dark Gradient" },
                { key: "themed-scene" as const, label: "Themed Scene" },
                { key: "clean-white" as const, label: "Clean White" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPosterSettings({ background: key })}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium transition-colors",
                  posterSettings.background === key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Tagline
            {analysis?.tagline && (
              <span className="ml-2 text-amber-500 normal-case font-normal">
                <Sparkles className="w-3 h-3 inline" /> AI generated
              </span>
            )}
          </label>
          <input
            type="text"
            value={posterSettings.tagline}
            onChange={(e) => setPosterSettings({ tagline: e.target.value })}
            placeholder="Enter a marketing tagline..."
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus-ring"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Features List
            {analysis?.features && (
              <span className="ml-2 text-amber-500 normal-case font-normal">
                <Sparkles className="w-3 h-3 inline" /> AI generated
              </span>
            )}
          </label>
          <div className="space-y-2">
            {posterSettings.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const next = [...posterSettings.features];
                    next[i] = e.target.value;
                    setPosterSettings({ features: next });
                  }}
                  className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus-ring"
                />
                <button
                  onClick={() => {
                    const next = posterSettings.features.filter(
                      (_, j) => j !== i
                    );
                    setPosterSettings({ features: next });
                  }}
                  className="text-zinc-400 hover:text-red-500 text-xs"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setPosterSettings({
                  features: [...posterSettings.features, ""],
                })
              }
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              + Add feature
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
            isGenerating
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
              <FileImage className="w-4 h-4" /> Generate Poster
            </>
          )}
        </button>
      </div>
    </div>
  );
}
