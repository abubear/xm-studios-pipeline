"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Loader2,
  CheckCircle2,
  Download,
  ArrowRight,
  ImageIcon,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowProgress } from "@/hooks/use-workflow-progress";
import { WorkflowTerminalMonitor } from "@/components/workflow/workflow-monitor";

const ModelViewer = dynamic(
  () =>
    import("@/components/3d/model-viewer").then((mod) => mod.ModelViewer),
  { ssr: false }
);

interface ModelGenerationWorkspaceProps {
  sessionId: string;
  characterName?: string;
  frontViewUrl?: string;
  topViewUrl?: string;
}

type Stage = "idle" | "generating-3d" | "3d-complete" | "rigging" | "complete";

export function ModelGenerationWorkspace({
  sessionId,
  characterName: _characterName, // eslint-disable-line @typescript-eslint/no-unused-vars
  frontViewUrl,
  topViewUrl,
}: ModelGenerationWorkspaceProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [, setRiggedModelUrl] = useState<string | null>(null);

  const trellis = useWorkflowProgress();
  const rigging = useWorkflowProgress();

  async function handleGenerate3D() {
    setStage("generating-3d");
    trellis.start();
    trellis.addLog("Starting Trellis 2 — 3D model generation");
    trellis.addLog("Input: Front view + Top view PNGs");

    try {
      // In production: call trellis2Generate() via ViewComfy
      // Simulate generation
      for (let i = 0; i <= 100; i += 5) {
        await new Promise((r) => setTimeout(r, 200));
        trellis.onProgress({
          type: "progress",
          progress: i,
          message: i < 30 ? "Processing input images..." : i < 70 ? "Generating 3D mesh..." : "Texturing model...",
          timestamp: Date.now(),
        });
      }

      // Placeholder — in production this would be the actual GLB URL
      setModelUrl(null); // No actual GLB to load
      setStage("3d-complete");

      trellis.complete({
        success: true,
        outputUrls: ["model.glb"],
        duration: trellis.elapsed,
      });
      trellis.addLog("3D model generated successfully (GLB format)");
    } catch (err) {
      trellis.fail(err instanceof Error ? err.message : "3D generation failed");
      setStage("idle");
    }
  }

  async function handleAutoRig() {
    setStage("rigging");
    rigging.start();
    rigging.addLog("Starting UniRig — Auto rigging");
    rigging.addLog("Skeleton type: humanoid");

    try {
      // In production: call uniRigAutoRig() via ViewComfy
      for (let i = 0; i <= 100; i += 5) {
        await new Promise((r) => setTimeout(r, 150));
        rigging.onProgress({
          type: "progress",
          progress: i,
          message: i < 40 ? "Analyzing mesh topology..." : i < 80 ? "Placing skeleton joints..." : "Binding weights...",
          timestamp: Date.now(),
        });
      }

      setRiggedModelUrl(null); // Placeholder
      setStage("complete");

      rigging.complete({
        success: true,
        outputUrls: ["model-rigged.fbx"],
        duration: rigging.elapsed,
      });
      rigging.addLog("Auto-rigging complete (FBX with skeleton)");
    } catch (err) {
      rigging.fail(err instanceof Error ? err.message : "Rigging failed");
      setStage("3d-complete");
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Pipeline progress indicator */}
      <div className="flex items-center gap-3">
        <StageIndicator
          label="3D Generation"
          active={stage === "generating-3d"}
          complete={["3d-complete", "rigging", "complete"].includes(stage)}
        />
        <div className="w-8 h-px bg-zinc-200" />
        <StageIndicator
          label="Auto Rigging"
          active={stage === "rigging"}
          complete={stage === "complete"}
        />
        <div className="w-8 h-px bg-zinc-200" />
        <StageIndicator
          label="Review"
          active={false}
          complete={stage === "complete"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input views + 3D viewer */}
        <div className="space-y-4">
          {/* Input images */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Front View
              </p>
              <div className="aspect-square bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center">
                {frontViewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={frontViewUrl}
                    alt="Front view"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-300" />
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Top View
              </p>
              <div className="aspect-square bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center">
                {topViewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={topViewUrl}
                    alt="Top view"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-300" />
                )}
              </div>
            </div>
          </div>

          {/* 3D Model Viewer */}
          <div className="aspect-square bg-zinc-50 rounded-2xl overflow-hidden">
            {modelUrl ? (
              <ModelViewer url={modelUrl} className="w-full h-full" />
            ) : stage !== "idle" ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Box className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">
                    3D model preview will appear here
                  </p>
                  <p className="text-[10px] text-zinc-300 mt-1">
                    (Connect GPU for actual GLB output)
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Box className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">
                    Generate a 3D model to view it here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls + Monitors */}
        <div className="space-y-4">
          {/* Stage 09: 3D Generation */}
          <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Stage 09 — Trellis 2 3D Generation
                </h3>
              </div>
              {["3d-complete", "rigging", "complete"].includes(stage) && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>

            <button
              onClick={handleGenerate3D}
              disabled={stage !== "idle" && stage !== "3d-complete"}
              className={cn(
                "w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors",
                stage === "idle"
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              )}
            >
              {stage === "generating-3d" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating
                  3D Model...
                </>
              ) : (
                <>
                  <Box className="w-3.5 h-3.5" /> Generate 3D Model
                </>
              )}
            </button>

            {trellis.status !== "idle" && (
              <WorkflowTerminalMonitor
                state={trellis}
                title="3D Model Generation"
                defaultCollapsed={stage !== "generating-3d"}
              />
            )}
          </div>

          {/* Stage 10: Auto Rigging */}
          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4 space-y-3 transition-opacity",
              stage === "idle" || stage === "generating-3d"
                ? "opacity-50"
                : "opacity-100"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Stage 10 — UniRig Auto-Rigging
                </h3>
              </div>
              {stage === "complete" && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>

            <button
              onClick={handleAutoRig}
              disabled={stage !== "3d-complete"}
              className={cn(
                "w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors",
                stage === "3d-complete"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              )}
            >
              {stage === "rigging" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                  Auto-Rigging...
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5" /> Start Auto-Rig
                </>
              )}
            </button>

            {rigging.status !== "idle" && (
              <WorkflowTerminalMonitor
                state={rigging}
                title="Auto-Rigging"
                defaultCollapsed={stage !== "rigging"}
              />
            )}
          </div>

          {/* Complete actions */}
          {stage === "complete" && (
            <div className="bg-green-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 3D Model Ready
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white flex items-center justify-center gap-1.5 hover:bg-zinc-800">
                  <Download className="w-3.5 h-3.5" /> Download FBX
                </button>
                <a
                  href={`/pipeline/${sessionId}/factory`}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white flex items-center justify-center gap-1.5 hover:bg-amber-600"
                >
                  Sculptor Pack <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StageIndicator({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
          complete
            ? "bg-green-500 text-white"
            : active
            ? "bg-amber-500 text-white"
            : "bg-zinc-200 text-zinc-400"
        )}
      >
        {complete ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : active ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          "○"
        )}
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          complete
            ? "text-green-600"
            : active
            ? "text-amber-600"
            : "text-zinc-400"
        )}
      >
        {label}
      </span>
    </div>
  );
}
