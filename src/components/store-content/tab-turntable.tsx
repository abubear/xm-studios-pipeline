"use client";

import { useState } from "react";
import {
  RotateCw,
  Download,
  Play,
  Loader2,
  Camera,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreContentStore } from "@/hooks/use-store-content-store";
import { useGenerateForTab } from "@/hooks/use-store-content";
import { WorkflowMonitor } from "./workflow-monitor";

export function TabTurntable() {
  const {
    turntableSettings,
    setTurntableSettings,
    turntableResult,
    setTurntableResult,
    markTabComplete,
    isGenerating,
    generatingTab,
    setGeneratingTab,
    setIsGenerating,
  } = useStoreContentStore();

  const { generateTab } = useGenerateForTab("turntable");
  const [workflowSteps, setWorkflowSteps] = useState<
    { label: string; status: "pending" | "running" | "complete" | "error"; progress?: number }[]
  >([]);

  const isRunning = generatingTab === "turntable";

  async function handleGenerate() {
    setGeneratingTab("turntable");
    setIsGenerating(true);

    setWorkflowSteps([
      { label: "Loading 3D model", status: "running", progress: 0 },
      { label: "Setting up camera path", status: "pending" },
      { label: "Rendering frames", status: "pending" },
      { label: "Encoding video", status: "pending" },
    ]);

    // Simulate workflow progression
    await simulateStep(0, "Loading 3D model", 1500);
    await simulateStep(1, "Setting up camera path", 1000);
    await simulateStep(2, "Rendering frames", 3000);
    await simulateStep(3, "Encoding video", 1500);

    try {
      const result = await generateTab(turntableSettings as unknown as Record<string, unknown>);
      if (result) {
        setTurntableResult({
          id: result.id,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          label: "360° Turntable",
          status: "complete",
        });
        markTabComplete("turntable");
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

  async function simulateStep(index: number, label: string, duration: number) {
    setWorkflowSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, status: "running", progress: 0 }
          : i < index
          ? { ...s, status: "complete", progress: 100 }
          : s
      )
    );

    const steps = 10;
    for (let j = 1; j <= steps; j++) {
      await new Promise((r) => setTimeout(r, duration / steps));
      setWorkflowSteps((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, progress: Math.round((j / steps) * 100) } : s
        )
      );
    }

    setWorkflowSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, status: "complete", progress: 100 } : s
      )
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Preview */}
      <div className="space-y-4">
        <div className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
          {turntableResult ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={turntableResult.url}
                alt="Turntable preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                <button className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg text-xs flex items-center gap-1.5">
                  <Play className="w-3 h-3" /> Preview
                </button>
                <a
                  href={turntableResult.url}
                  download
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            </>
          ) : (
            <div className="text-center">
              <RotateCw className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                360° turntable preview will appear here
              </p>
            </div>
          )}
        </div>

        {isRunning && <WorkflowMonitor steps={workflowSteps} title="SV3D Workflow" />}
      </div>

      {/* Right: Settings */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Frame Count: {turntableSettings.frameCount}
          </label>
          <input
            type="range"
            min={12}
            max={36}
            step={1}
            value={turntableSettings.frameCount}
            onChange={(e) =>
              setTurntableSettings({ frameCount: parseInt(e.target.value) })
            }
            className="w-full accent-amber-500 h-1"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>12</span>
            <span>24</span>
            <span>36</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Camera Elevation: {turntableSettings.cameraElevation}°
          </label>
          <input
            type="range"
            min={-15}
            max={45}
            step={5}
            value={turntableSettings.cameraElevation}
            onChange={(e) =>
              setTurntableSettings({
                cameraElevation: parseInt(e.target.value),
              })
            }
            className="w-full accent-amber-500 h-1"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>-15°</span>
            <span>15°</span>
            <span>45°</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Output Format
          </label>
          <div className="flex gap-2">
            {(["mp4", "gif", "webm"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTurntableSettings({ outputFormat: fmt })}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                  turntableSettings.outputFormat === fmt
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                <Film className="w-3 h-3" />
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Background
          </label>
          <div className="flex gap-2">
            {(["transparent", "white", "studio"] as const).map((bg) => (
              <button
                key={bg}
                onClick={() => setTurntableSettings({ background: bg })}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors",
                  turntableSettings.background === bg
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {bg}
              </button>
            ))}
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
              <Camera className="w-4 h-4" /> Generate Turntable
            </>
          )}
        </button>
      </div>
    </div>
  );
}
