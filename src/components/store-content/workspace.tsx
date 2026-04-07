"use client";

import { useEffect } from "react";
import {
  CheckCircle2,
  Loader2,
  Zap,
  Users,
  ChevronDown,
  WifiOff,
} from "lucide-react";
import { useComfyUIStatus } from "@/hooks/use-comfyui-status";
import { cn } from "@/lib/utils";
import {
  useStoreContentStore,
  CONTENT_TABS,
  type ContentTab,
} from "@/hooks/use-store-content-store";
import { useAnalyzeSession } from "@/hooks/use-store-content";
import { TabTurntable } from "./tab-turntable";
import { TabHeroShots } from "./tab-hero-shots";
import { TabCloseups } from "./tab-closeups";
import { TabAnimation } from "./tab-animation";
import { TabPoster } from "./tab-poster";
import { TabPackage } from "./tab-package";
import { WorkflowMonitor } from "./workflow-monitor";
import { useState } from "react";

interface WorkspaceProps {
  sessionId: string;
  characterName?: string;
}

export function StoreContentWorkspace({
  sessionId,
  characterName,
}: WorkspaceProps) {
  const {
    activeTab,
    setActiveTab,
    completedTabs,
    isGenerating,
    isBatchRunning,
    setIsBatchRunning,
    batchSteps,
    setBatchSteps,
    updateBatchStep,
    setSessionId,
    markTabComplete,
    generatingTab,
  } = useStoreContentStore();

  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const comfyConnected = useComfyUIStatus();

  // Set session ID in store
  useEffect(() => {
    setSessionId(sessionId);
  }, [sessionId, setSessionId]);

  // Pre-fetch analysis for auto-filling fields
  useAnalyzeSession(sessionId);

  const TAB_COMPONENTS: Record<ContentTab, React.ReactNode> = {
    turntable: <TabTurntable />,
    "hero-shots": <TabHeroShots />,
    closeups: <TabCloseups />,
    animation: <TabAnimation />,
    poster: <TabPoster />,
    package: <TabPackage />,
  };

  // Batch mode: generate all content sequentially
  async function runBatchGeneration() {
    setIsBatchRunning(true);
    const tabsToRun: ContentTab[] = [
      "turntable",
      "hero-shots",
      "closeups",
      "animation",
      "poster",
    ];

    setBatchSteps(
      tabsToRun.map((tab) => ({
        tab,
        status: "pending" as const,
        progress: 0,
      }))
    );

    for (let i = 0; i < tabsToRun.length; i++) {
      const tab = tabsToRun[i];
      setActiveTab(tab);

      updateBatchStep(tab, { status: "running", progress: 0 });

      // Simulate progress over time
      const duration = 6000;
      const steps = 20;
      for (let k = 1; k <= steps; k++) {
        await new Promise((r) => setTimeout(r, duration / steps));
        updateBatchStep(tab, {
          progress: Math.round((k / steps) * 100),
        });
      }

      updateBatchStep(tab, { status: "complete", progress: 100 });
      markTabComplete(tab);
    }

    // Switch to package tab when done
    setActiveTab("package");
    markTabComplete("package");
    setIsBatchRunning(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* ComfyUI offline banner */}
      {!comfyConnected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-100 text-orange-700 text-xs font-medium">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          ComfyUI is offline — generation is unavailable. Start ComfyUI to enable content generation.
        </div>
      )}
      {/* Tab bar + actions */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="flex items-center justify-between px-4">
          {/* Tabs */}
          <div className="flex">
            {CONTENT_TABS.map((tab) => {
              const isComplete = completedTabs.has(tab.key);
              const isActive = activeTab === tab.key;
              const isTabGenerating = generatingTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    isActive
                      ? "text-zinc-900 border-zinc-900"
                      : "text-zinc-400 border-transparent hover:text-zinc-600"
                  )}
                >
                  {isTabGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                  ) : isComplete ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : null}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 py-2">
            {/* Multi-character selector */}
            <div className="relative">
              <button
                onClick={() => setShowCharacterSelect(!showCharacterSelect)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3 h-3" />
                Characters
                <ChevronDown className="w-3 h-3" />
              </button>

              {showCharacterSelect && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-zinc-100 p-3 z-50">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Multi-Character Batch
                  </p>
                  <p className="text-xs text-zinc-500 mb-3">
                    Select multiple characters to generate content for all of
                    them sequentially.
                  </p>
                  <div className="bg-zinc-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-400">
                      {characterName ? (
                        <>
                          Currently: <strong>{characterName}</strong>
                        </>
                      ) : (
                        "No characters selected"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Batch generate */}
            <button
              onClick={() => {
                if (isBatchRunning) return;
                setShowBatchPanel(!showBatchPanel);
              }}
              disabled={isGenerating && !isBatchRunning}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                isBatchRunning
                  ? "bg-amber-100 text-amber-700"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              )}
            >
              {isBatchRunning ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Batch Running...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" /> Generate All Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Batch progress panel */}
      {(showBatchPanel || isBatchRunning) && (
        <div className="border-b border-zinc-100 bg-amber-50/50 px-4 py-3">
          {isBatchRunning ? (
            <WorkflowMonitor
              steps={batchSteps.map((s) => ({
                label:
                  CONTENT_TABS.find((t) => t.key === s.tab)?.label || s.tab,
                status: s.status,
                progress: s.progress,
              }))}
              title="Batch Generation"
            />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Generate All Content
                </p>
                <p className="text-xs text-zinc-500">
                  Runs all 5 content generators sequentially. Progress is saved
                  automatically.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBatchPanel(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={runBatchGeneration}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3" /> Start Batch
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {TAB_COMPONENTS[activeTab]}
      </div>
    </div>
  );
}
