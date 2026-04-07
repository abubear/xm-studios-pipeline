"use client";

import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline-stages";

interface PipelineProgressProps {
  currentStage: number;
  blockedStage?: number | null;
  compact?: boolean;
}

export function PipelineProgress({
  currentStage,
  blockedStage,
  compact = false,
}: PipelineProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STAGES.map((stage) => {
        const isCompleted = stage.id < currentStage;
        const isCurrent = stage.id === currentStage;
        const isBlocked = stage.id === blockedStage;
        const isGate = !!stage.gate;

        return (
          <div
            key={stage.id}
            title={`${stage.id.toString().padStart(2, "0")} — ${stage.name}`}
            className="relative group"
          >
            <div
              className={cn(
                "rounded-full transition-all",
                compact ? "w-2 h-2" : "w-2.5 h-2.5",
                isBlocked
                  ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                  : isCurrent
                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"
                    : isCompleted
                      ? "bg-amber-500"
                      : isGate
                        ? "bg-zinc-300 ring-1 ring-zinc-400"
                        : "bg-zinc-200"
              )}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {stage.id.toString().padStart(2, "0")}: {stage.shortName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
