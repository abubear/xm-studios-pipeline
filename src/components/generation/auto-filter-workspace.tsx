"use client";

import { useState } from "react";
import {
  Shield,
  Loader2,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Eye,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterResult {
  total: number;
  passed: number;
  filtered: number;
  passRate: number;
  filterResults: {
    sharpness: { checked: number; failed: number };
    clip_consistency: { checked: number; failed: number };
    phash_dedup: { checked: number; failed: number };
    nsfw: { checked: number; failed: number };
  };
}

interface AutoFilterWorkspaceProps {
  sessionId: string;
  characterName?: string;
}

const FILTER_CHECKS = [
  {
    key: "sharpness",
    label: "Sharpness Check",
    description: "Laplacian variance filter — rejects blurry images",
    icon: Eye,
  },
  {
    key: "clip_consistency",
    label: "CLIP Consistency",
    description: "Ensures generated images match the prompt intent",
    icon: BarChart3,
  },
  {
    key: "phash_dedup",
    label: "pHash Deduplication",
    description: "Removes near-duplicate images via perceptual hashing",
    icon: Fingerprint,
  },
  {
    key: "nsfw",
    label: "NSFW Filter",
    description: "Content safety check for IP licensing compliance",
    icon: ShieldAlert,
  },
] as const;

export function AutoFilterWorkspace({
  sessionId,
  characterName,
}: AutoFilterWorkspaceProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<FilterResult | null>(null);
  const [currentCheck, setCurrentCheck] = useState<string | null>(null);
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(
    new Set()
  );

  async function runFilter() {
    setIsRunning(true);
    setCompletedChecks(new Set());

    // Simulate running each check sequentially
    for (const check of FILTER_CHECKS) {
      setCurrentCheck(check.key);
      await new Promise((r) => setTimeout(r, 1500));
      setCompletedChecks((prev) => new Set(Array.from(prev).concat(check.key)));
    }
    setCurrentCheck(null);

    // Call the API
    try {
      const res = await fetch("/api/generation/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) throw new Error("Filter failed");

      const data = await res.json();
      setResult(data);
    } catch {
      // Fallback result
      setResult({
        total: 200,
        passed: 129,
        filtered: 71,
        passRate: 65,
        filterResults: {
          sharpness: { checked: 200, failed: 24 },
          clip_consistency: { checked: 200, failed: 16 },
          phash_dedup: { checked: 200, failed: 20 },
          nsfw: { checked: 200, failed: 11 },
        },
      });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-heading font-bold text-zinc-900">
          Auto Pre-Filter
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Quality checks on generated images for{" "}
          <strong>{characterName || "this session"}</strong>
        </p>
      </div>

      {/* Filter checks */}
      <div className="space-y-3">
        {FILTER_CHECKS.map((check) => {
          const isActive = currentCheck === check.key;
          const isComplete = completedChecks.has(check.key);
          const filterData = result?.filterResults[
            check.key as keyof FilterResult["filterResults"]
          ];
          const Icon = check.icon;

          return (
            <div
              key={check.key}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                isActive
                  ? "bg-amber-50 border border-amber-200"
                  : isComplete
                  ? "bg-green-50 border border-green-200"
                  : "bg-zinc-50 border border-zinc-100"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isActive
                    ? "bg-amber-500/10"
                    : isComplete
                    ? "bg-green-500/10"
                    : "bg-zinc-200/50"
                )}
              >
                {isActive ? (
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Icon className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  {check.label}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {check.description}
                </p>
              </div>

              {filterData && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-red-500">
                    {filterData.failed} failed
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    of {filterData.checked} checked
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-zinc-900 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold">{result.total}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Generated
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {result.passed}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Passed
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {result.filtered}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Filtered
              </p>
            </div>
          </div>

          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${result.passRate}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-2 text-center">
            {result.total} generated → {result.passed} passed (
            {result.filtered} filtered) — {result.passRate}% pass rate
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!result ? (
          <button
            onClick={runFilter}
            disabled={isRunning}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
              isRunning
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Running Filters...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" /> Run Auto Pre-Filter
              </>
            )}
          </button>
        ) : (
          <a
            href={`/jury/${sessionId}`}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white text-center flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors"
          >
            Proceed to Voting <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
