"use client";

import {
  Download,
  Upload,
  CheckCircle2,
  Circle,
  Package,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStoreContentStore,
  type ContentTab,
} from "@/hooks/use-store-content-store";

const PACKAGE_FOLDERS = [
  { tab: "turntable" as ContentTab, folder: "360-turntable", label: "360° Turntable" },
  { tab: "hero-shots" as ContentTab, folder: "hero-shots", label: "Hero Shots" },
  { tab: "closeups" as ContentTab, folder: "closeups", label: "Detail Closeups" },
  { tab: "animation" as ContentTab, folder: "scene-animation", label: "Scene Animation" },
  { tab: "poster" as ContentTab, folder: "poster", label: "Pre-Order Poster" },
];

export function TabPackage() {
  const {
    completedTabs,
    turntableResult,
    heroShots,
    closeups,
    animationResult,
    posterResult,
    isBatchRunning,
  } = useStoreContentStore();

  const totalItems = PACKAGE_FOLDERS.length;
  const completedItems = PACKAGE_FOLDERS.filter((p) =>
    completedTabs.has(p.tab)
  ).length;
  const allComplete = completedItems === totalItems;

  // Get thumbnails for completed items
  function getThumbnail(tab: ContentTab): string | null {
    switch (tab) {
      case "turntable":
        return turntableResult?.url || null;
      case "hero-shots":
        return heroShots.values().next().value?.url || null;
      case "closeups":
        return closeups.values().next().value?.url || null;
      case "animation":
        return animationResult?.url || null;
      case "poster":
        return posterResult?.url || null;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="bg-zinc-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Content Package
              </h3>
              <p className="text-xs text-zinc-400">
                {completedItems} of {totalItems} content types complete
              </p>
            </div>
          </div>

          {/* Progress circle */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#e4e4e7"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke={allComplete ? "#22c55e" : "#f59e0b"}
                strokeWidth="4"
                strokeDasharray={`${(completedItems / totalItems) * 150.8} 150.8`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-900">
              {Math.round((completedItems / totalItems) * 100)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allComplete ? "bg-green-500" : "bg-amber-500"
            )}
            style={{
              width: `${(completedItems / totalItems) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Content Checklist
        </h4>

        {PACKAGE_FOLDERS.map(({ tab, folder, label }) => {
          const isComplete = completedTabs.has(tab);
          const thumbnail = getThumbnail(tab);

          return (
            <div
              key={tab}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors",
                isComplete ? "bg-green-50" : "bg-zinc-50"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
              )}

              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg bg-zinc-200 overflow-hidden shrink-0">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isComplete ? "text-green-700" : "text-zinc-600"
                  )}
                >
                  {label}
                </p>
                <p className="text-[10px] text-zinc-400">/{folder}/</p>
              </div>

              {isComplete && (
                <span className="text-[10px] text-green-500 font-medium">
                  Ready
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* metadata.json preview */}
      <div className="bg-zinc-950 rounded-xl p-4">
        <p className="text-[10px] text-zinc-500 font-mono mb-2">
          metadata.json
        </p>
        <pre className="text-[11px] text-zinc-400 font-mono overflow-x-auto">
          {JSON.stringify(
            {
              package: "store-content",
              items: PACKAGE_FOLDERS.map((p) => ({
                type: p.tab,
                folder: p.folder,
                status: completedTabs.has(p.tab) ? "complete" : "pending",
              })),
              completedAt: allComplete
                ? new Date().toISOString()
                : null,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          disabled={!allComplete || isBatchRunning}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
            allComplete && !isBatchRunning
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          )}
        >
          {isBatchRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Packaging...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Complete Package
            </>
          )}
        </button>

        <button
          disabled={!allComplete}
          className={cn(
            "px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-colors",
            allComplete
              ? "border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
              : "border-zinc-200 text-zinc-400 cursor-not-allowed"
          )}
        >
          <Upload className="w-4 h-4" /> Upload to Store
        </button>
      </div>
    </div>
  );
}
