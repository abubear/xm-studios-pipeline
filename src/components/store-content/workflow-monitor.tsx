"use client";

import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  label: string;
  status: "pending" | "running" | "complete" | "error";
  progress?: number;
  detail?: string;
}

interface WorkflowMonitorProps {
  steps: WorkflowStep[];
  title?: string;
  className?: string;
}

export function WorkflowMonitor({ steps, title, className }: WorkflowMonitorProps) {
  const overallProgress =
    steps.length > 0
      ? Math.round(
          (steps.filter((s) => s.status === "complete").length / steps.length) *
            100
        )
      : 0;

  return (
    <div className={cn("bg-zinc-50 rounded-xl p-4 space-y-3", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
          <span className="text-xs text-zinc-400">{overallProgress}% complete</span>
        </div>
      )}

      {/* Overall progress bar */}
      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <StepIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium truncate",
                    step.status === "complete"
                      ? "text-green-600"
                      : step.status === "running"
                      ? "text-amber-600"
                      : step.status === "error"
                      ? "text-red-500"
                      : "text-zinc-400"
                  )}
                >
                  {step.label}
                </span>
                {step.progress !== undefined && step.status === "running" && (
                  <span className="text-[10px] text-zinc-400 ml-2">
                    {step.progress}%
                  </span>
                )}
              </div>
              {step.status === "running" && step.progress !== undefined && (
                <div className="h-1 bg-zinc-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}
              {step.detail && (
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: WorkflowStep["status"] }) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
    case "running":
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    default:
      return <Clock className="w-4 h-4 text-zinc-300 shrink-0" />;
  }
}

// Compact inline progress for batch mode
export function InlineProgress({
  label,
  progress,
  status,
}: {
  label: string;
  progress: number;
  status: "pending" | "running" | "complete" | "error";
}) {
  return (
    <div className="flex items-center gap-2">
      <StepIcon status={status} />
      <span className="text-xs text-zinc-600 flex-1">{label}</span>
      <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-zinc-400 w-8 text-right">
        {progress}%
      </span>
    </div>
  );
}
