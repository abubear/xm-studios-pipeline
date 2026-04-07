"use client";

import { useState, useCallback, useRef } from "react";
import type {
  WorkflowProgressEvent,
  WorkflowResult,
} from "@/lib/viewcomfy/client";

export interface LogEntry {
  timestamp: number;
  message: string;
  type: "info" | "progress" | "preview" | "error" | "success";
}

export interface WorkflowProgressState {
  /** Current status */
  status: "idle" | "running" | "complete" | "error";
  /** 0-100 progress percentage */
  progress: number;
  /** Most recent log message */
  currentLog: string;
  /** Full log history */
  logs: LogEntry[];
  /** Final result when complete */
  result: WorkflowResult | null;
  /** Error message if failed */
  error: string | null;
  /** Whether a workflow is currently executing */
  isRunning: boolean;
  /** Preview image URL (if workflow emits previews) */
  previewUrl: string | null;
  /** Elapsed time in ms */
  elapsed: number;
  /** Start timestamp */
  startedAt: number | null;
}

export interface UseWorkflowProgressReturn extends WorkflowProgressState {
  /** Progress callback to pass to workflow functions */
  onProgress: (event: WorkflowProgressEvent) => void;
  /** Mark workflow as started */
  start: () => void;
  /** Mark workflow as complete with result */
  complete: (result: WorkflowResult) => void;
  /** Mark workflow as failed */
  fail: (error: string) => void;
  /** Reset to idle state */
  reset: () => void;
  /** Add a manual log entry */
  addLog: (message: string, type?: LogEntry["type"]) => void;
}

const INITIAL_STATE: WorkflowProgressState = {
  status: "idle",
  progress: 0,
  currentLog: "",
  logs: [],
  result: null,
  error: null,
  isRunning: false,
  previewUrl: null,
  elapsed: 0,
  startedAt: null,
};

export function useWorkflowProgress(): UseWorkflowProgressReturn {
  const [state, setState] = useState<WorkflowProgressState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setState((prev) => ({
          ...prev,
          elapsed: Date.now() - startTimeRef.current!,
        }));
      }
    }, 500);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const addLogEntry = useCallback(
    (message: string, type: LogEntry["type"] = "info") => {
      setState((prev) => ({
        ...prev,
        currentLog: message,
        logs: [
          ...prev.logs,
          { timestamp: Date.now(), message, type },
        ].slice(-200), // Keep last 200 entries
      }));
    },
    []
  );

  const onProgress = useCallback(
    (event: WorkflowProgressEvent) => {
      switch (event.type) {
        case "progress":
          setState((prev) => ({
            ...prev,
            progress: event.progress ?? prev.progress,
          }));
          if (event.message) {
            addLogEntry(event.message, "progress");
          }
          break;

        case "log":
          if (event.message) {
            addLogEntry(event.message, "info");
          }
          break;

        case "preview":
          if (event.previewUrl) {
            setState((prev) => ({
              ...prev,
              previewUrl: event.previewUrl!,
            }));
            addLogEntry("Preview image received", "preview");
          }
          break;

        case "output":
          if (event.outputUrls?.length) {
            addLogEntry(
              `Output ready: ${event.outputUrls.length} file(s)`,
              "success"
            );
          }
          break;

        case "error":
          setState((prev) => ({
            ...prev,
            error: event.error || "Unknown error",
            status: "error",
          }));
          addLogEntry(event.error || "Unknown error", "error");
          break;

        case "complete":
          setState((prev) => ({
            ...prev,
            progress: 100,
            status: "complete",
            isRunning: false,
          }));
          addLogEntry("Workflow complete", "success");
          stopTimer();
          break;
      }
    },
    [addLogEntry, stopTimer]
  );

  const start = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      status: "running",
      isRunning: true,
      startedAt: Date.now(),
    });
    startTimer();
    addLogEntry("Workflow started", "info");
  }, [startTimer, addLogEntry]);

  const complete = useCallback(
    (result: WorkflowResult) => {
      setState((prev) => ({
        ...prev,
        status: "complete",
        progress: 100,
        isRunning: false,
        result,
      }));
      stopTimer();
      addLogEntry(
        `Workflow completed in ${(result.duration / 1000).toFixed(1)}s`,
        "success"
      );
    },
    [stopTimer, addLogEntry]
  );

  const fail = useCallback(
    (error: string) => {
      setState((prev) => ({
        ...prev,
        status: "error",
        isRunning: false,
        error,
      }));
      stopTimer();
      addLogEntry(error, "error");
    },
    [stopTimer, addLogEntry]
  );

  const reset = useCallback(() => {
    stopTimer();
    setState(INITIAL_STATE);
  }, [stopTimer]);

  return {
    ...state,
    onProgress,
    start,
    complete,
    fail,
    reset,
    addLog: addLogEntry,
  };
}
