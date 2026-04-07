"use client";

import { useState } from "react";
import {
  Play,
  Loader2,
  ImageIcon,
  Sliders,
  Zap,
  Clock,
  WifiOff,
} from "lucide-react";
import { useComfyUIStatus } from "@/hooks/use-comfyui-status";
import { cn } from "@/lib/utils";
import { useWorkflowProgress } from "@/hooks/use-workflow-progress";
import { WorkflowTerminalMonitor } from "@/components/workflow/workflow-monitor";

interface MassGenerationWorkspaceProps {
  sessionId: string;
  characterName?: string;
  masterReferenceUrl?: string;
}

export function MassGenerationWorkspace({
  sessionId,
  characterName,
  masterReferenceUrl,
}: MassGenerationWorkspaceProps) {
  const [batchCount, setBatchCount] = useState(20);
  const [prompt, setPrompt] = useState(
    characterName
      ? `XM Studios 1:4 scale polystone statue of ${characterName}, dynamic pose, detailed base, collectible figure`
      : ""
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low quality, deformed, text, watermark"
  );
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const workflow = useWorkflowProgress();
  const comfyConnected = useComfyUIStatus();

  async function handleGenerate() {
    workflow.start();
    workflow.addLog(`Starting mass generation: ${batchCount} images`);
    workflow.addLog(`Character: ${characterName || "Unknown"}`);

    try {
      const res = await fetch("/api/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          batchCount,
          settings: {
            prompt,
            negativePrompt,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      setGeneratedCount(data.totalGenerated);
      setIsComplete(true);

      workflow.complete({
        success: true,
        outputUrls: [],
        duration: workflow.elapsed,
      });
      workflow.addLog(
        `Generation complete: ${data.totalGenerated} images created`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      workflow.fail(msg);
    }
  }

  // Estimate runtime: ~2 seconds per image on GPU
  const estimatedMinutes = Math.ceil((batchCount * 2) / 60);

  return (
    <div className="space-y-0">
      {!comfyConnected && (
        <div className="flex items-center gap-2 px-6 py-2 bg-orange-50 border-b border-orange-100 text-orange-700 text-xs font-medium">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          ComfyUI is offline — generation is unavailable. Start ComfyUI to enable mass generation.
        </div>
      )}
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Master Reference */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Master Reference (Stage 02)
          </h3>
          <div className="aspect-[3/4] bg-zinc-100 rounded-2xl overflow-hidden flex items-center justify-center">
            {masterReferenceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={masterReferenceUrl}
                alt="Master reference"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">
                  Master reference from Scene Composer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Configuration */}
        <div className="space-y-5">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Configuration
          </h3>

          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-2">
              Batch Count: {batchCount}
            </label>
            <input
              type="range"
              min={1}
              max={200}
              step={1}
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1</span>
              <span>50</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the character concept..."
              rows={4}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-2">
              Negative Prompt
            </label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 resize-none"
            />
          </div>

          {/* Runtime estimate */}
          <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-xs font-medium text-amber-700">
                Estimated Runtime
              </p>
              <p className="text-[10px] text-amber-600">
                ~{estimatedMinutes} min for {batchCount} images on GPU
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={workflow.isRunning || !prompt}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
              workflow.isRunning || !prompt
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {workflow.isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Generation
              </>
            )}
          </button>
        </div>

        {/* Right: Status */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Generation Status
          </h3>

          {workflow.status !== "idle" && (
            <WorkflowTerminalMonitor
              state={workflow}
              title="QWen Mass Generation"
              onRetry={handleGenerate}
            />
          )}

          {isComplete && (
            <div className="bg-green-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700">
                {generatedCount} images generated
              </p>
              <p className="text-xs text-green-600">
                Images are now available in the Jury app for voting.
              </p>
              <a
                href={`/generation/${sessionId}/filter`}
                className="block w-full py-2.5 rounded-xl text-xs font-semibold bg-green-500 text-white text-center hover:bg-green-600 transition-colors"
              >
                Proceed to Auto Pre-Filter →
              </a>
            </div>
          )}

          {workflow.status === "idle" && (
            <div className="bg-zinc-50 rounded-xl p-4">
              <p className="text-xs text-zinc-400">
                Configure generation settings and click Start to begin creating
                concept variations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
