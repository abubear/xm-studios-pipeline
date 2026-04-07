"use client";

import { useState } from "react";
import {
  RotateCw,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowProgress } from "@/hooks/use-workflow-progress";
import { WorkflowTerminalMonitor } from "@/components/workflow/workflow-monitor";

interface ApprovedConcept {
  id: string;
  url: string;
  prompt?: string;
  rank?: number;
}

interface TurnaroundWorkspaceProps {
  sessionId: string;
  characterName?: string;
  approvedConcepts: ApprovedConcept[];
}

const VIEW_LABELS = ["Front", "Quarter", "Side", "Back"] as const;

interface TurnaroundResult {
  conceptId: string;
  views: { angle: string; url: string }[];
}

export function TurnaroundWorkspace({
  sessionId,
  characterName,
  approvedConcepts,
}: TurnaroundWorkspaceProps) {
  const [results, setResults] = useState<Map<string, TurnaroundResult>>(
    new Map()
  );
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const workflow = useWorkflowProgress();

  async function generateForConcept(concept: ApprovedConcept) {
    setActiveConcept(concept.id);
    workflow.start();
    workflow.addLog(`Generating turnaround for concept #${concept.id.slice(0, 8)}`);

    try {
      // In production: call qwenMultiAngle() via ViewComfy
      // Simulate with placeholder images
      await new Promise((r) => setTimeout(r, 3000));

      const views = VIEW_LABELS.map((angle, i) => ({
        angle,
        url: `https://picsum.photos/seed/${concept.id}-${angle}-${i}/512/512`,
      }));

      setResults((prev) => {
        const next = new Map(prev);
        next.set(concept.id, { conceptId: concept.id, views });
        return next;
      });

      workflow.complete({
        success: true,
        outputUrls: views.map((v) => v.url),
        duration: workflow.elapsed,
      });
    } catch (err) {
      workflow.fail(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setActiveConcept(null);
    }
  }

  async function generateAll() {
    for (const concept of approvedConcepts) {
      if (!results.has(concept.id)) {
        await generateForConcept(concept);
      }
    }
    setAllDone(true);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-heading font-bold text-zinc-900">
            Turnaround Sheets — {characterName}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {approvedConcepts.length} IP-approved concepts →
            Multi-angle views via QWen Advanced
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateAll}
            disabled={workflow.isRunning}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors",
              workflow.isRunning
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {workflow.isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" /> Generate All Turnarounds
              </>
            )}
          </button>
          {allDone && (
            <a
              href={`/pipeline/${sessionId}/3d`}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-green-500 text-white flex items-center gap-2 hover:bg-green-600 transition-colors"
            >
              Send to 3D Generation <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Monitor */}
      {workflow.status !== "idle" && (
        <WorkflowTerminalMonitor
          state={workflow}
          title="Multi-Angle Turnaround"
        />
      )}

      {/* Concept cards */}
      <div className="space-y-6">
        {approvedConcepts.map((concept) => {
          const result = results.get(concept.id);
          const isActive = activeConcept === concept.id;

          return (
            <div
              key={concept.id}
              className="bg-zinc-50 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center gap-4">
                {/* Source concept thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-zinc-200 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={concept.url}
                    alt="Concept"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    Concept #{concept.rank || "—"}
                  </p>
                  {concept.prompt && (
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                      {concept.prompt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {result ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  ) : (
                    <button
                      onClick={() => generateForConcept(concept)}
                      disabled={workflow.isRunning}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" /> Generate
                    </button>
                  )}
                </div>
              </div>

              {/* 4-panel turnaround result */}
              {result && (
                <div className="grid grid-cols-4 gap-3">
                  {result.views.map((view) => (
                    <div
                      key={view.angle}
                      className="bg-white rounded-xl overflow-hidden"
                    >
                      <div className="aspect-square bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={view.url}
                          alt={view.angle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] font-medium text-zinc-500 text-center py-1.5">
                        {view.angle}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!result && !isActive && (
                <div className="grid grid-cols-4 gap-3">
                  {VIEW_LABELS.map((label) => (
                    <div
                      key={label}
                      className="aspect-square bg-zinc-100 rounded-xl flex items-center justify-center"
                    >
                      <ImageIcon className="w-6 h-6 text-zinc-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {approvedConcepts.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">
              No IP-approved concepts found for this session.
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Complete IP Gate 1 review first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
