"use client";

import { useRef, useEffect } from "react";
import {
  Terminal,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { LogEntry, WorkflowProgressState } from "@/hooks/use-workflow-progress";

interface WorkflowMonitorProps {
  /** Pass the full state from useWorkflowProgress */
  state: WorkflowProgressState;
  /** Title displayed in the header */
  title?: string;
  /** Callback when user clicks Retry */
  onRetry?: () => void;
  /** Extra CSS classes */
  className?: string;
  /** Start collapsed */
  defaultCollapsed?: boolean;
}

export function WorkflowTerminalMonitor({
  state,
  title = "Workflow",
  onRetry,
  className,
  defaultCollapsed = false,
}: WorkflowMonitorProps) {
  const { status, progress, logs, error, previewUrl, elapsed, isRunning } =
    state;

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current && !collapsed) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, collapsed]);

  const elapsedStr = formatDuration(elapsed);
  const estimatedRemaining =
    progress > 0 && progress < 100
      ? formatDuration((elapsed / progress) * (100 - progress))
      : null;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        status === "error"
          ? "border-red-200 bg-red-50"
          : status === "complete"
          ? "border-green-200 bg-green-50"
          : "border-zinc-200 bg-zinc-50",
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <span className="text-sm font-semibold text-zinc-900">{title}</span>
          {isRunning && (
            <span className="text-xs text-amber-600 font-medium">
              {progress}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Timing */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <Clock className="w-3 h-3" />
            <span>{elapsedStr}</span>
            {estimatedRemaining && (
              <span className="text-zinc-300">
                ~{estimatedRemaining} remaining
              </span>
            )}
          </div>

          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-200">
        <div
          className={cn(
            "h-full transition-all duration-300",
            status === "error"
              ? "bg-red-500"
              : status === "complete"
              ? "bg-green-500"
              : "bg-amber-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!collapsed && (
        <>
          {/* Terminal log area */}
          <div
            ref={terminalRef}
            className="bg-zinc-950 text-zinc-300 font-mono text-[11px] leading-relaxed p-3 max-h-64 overflow-y-auto"
          >
            {logs.length === 0 ? (
              <span className="text-zinc-600">Waiting for output...</span>
            ) : (
              logs.map((entry, i) => (
                <LogLine key={i} entry={entry} />
              ))
            )}
            {isRunning && (
              <span className="inline-block w-2 h-3.5 bg-amber-500 animate-pulse ml-0.5" />
            )}
          </div>

          {/* Footer: preview thumbnails, error retry, success */}
          <div className="px-4 py-3 border-t border-zinc-200">
            {status === "error" && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-red-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            )}

            {status === "complete" && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-700 font-medium">
                  Completed in {elapsedStr}
                </span>

                {/* Output thumbnails */}
                {state.result?.outputUrls &&
                  state.result.outputUrls.length > 0 && (
                    <div className="flex gap-1.5 ml-auto">
                      {state.result.outputUrls.slice(0, 4).map((url, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Output ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {state.result.outputUrls.length > 4 && (
                        <span className="text-[10px] text-zinc-400 self-center">
                          +{state.result.outputUrls.length - 4}
                        </span>
                      )}
                    </div>
                  )}
              </div>
            )}

            {status === "running" && previewUrl && (
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-500">
                  Live preview available
                </span>
                <div className="ml-auto w-16 h-16 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {status === "idle" && (
              <p className="text-xs text-zinc-400">
                Ready to start workflow
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Log Line ──

function LogLine({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const colorMap: Record<LogEntry["type"], string> = {
    info: "text-zinc-400",
    progress: "text-amber-400",
    preview: "text-blue-400",
    error: "text-red-400",
    success: "text-green-400",
  };

  const prefixMap: Record<LogEntry["type"], string> = {
    info: "INFO",
    progress: "PROG",
    preview: "PREV",
    error: "ERR!",
    success: " OK ",
  };

  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-zinc-600 shrink-0">{time}</span>
      <span
        className={cn(
          "shrink-0 font-bold",
          colorMap[entry.type]
        )}
      >
        [{prefixMap[entry.type]}]
      </span>
      <span className={cn(entry.type === "error" ? "text-red-300" : "text-zinc-300")}>
        {entry.message}
      </span>
    </div>
  );
}

// ── Status Icon ──

function StatusIcon({ status }: { status: WorkflowProgressState["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
    case "complete":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Terminal className="w-4 h-4 text-zinc-400" />;
  }
}

// ── Format Duration ──

function formatDuration(ms: number): string {
  if (ms < 1000) return "0s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60)
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}
