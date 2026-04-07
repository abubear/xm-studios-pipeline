"use client";

import { useState, useMemo } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";
import { SessionRow } from "./session-row";
import { SessionCardSkeleton } from "./session-card-skeleton";
import { EmptyState } from "./empty-state";
import { NewSessionModal } from "./new-session-modal";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline-stages";
import { cn } from "@/lib/utils";

const TOTAL_STAGES = PIPELINE_STAGES.length;

function getStageCategory(stage: number) {
  if (stage <= 3) return "generation";
  if (stage === 4 || stage === 7) return "ip_gate";
  if (stage === 5 || stage === 6) return "voting";
  if (stage >= 8 && stage <= 11) return "sculpting";
  return "content";
}

const categoryConfig: Record<
  string,
  { label: string; color: string }
> = {
  generation: { label: "In Generation", color: "bg-blue-500" },
  voting: { label: "Awaiting Votes", color: "bg-amber-500" },
  ip_gate: { label: "IP Gate", color: "bg-rose-500" },
  sculpting: { label: "Sculptor Polish", color: "bg-green-500" },
  content: { label: "Store Content", color: "bg-teal-500" },
};

interface DashboardContentProps {
  firstName: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DashboardContent({ firstName }: DashboardContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: sessions, isLoading, error } = useSessions();

  const totalSessions = sessions?.length ?? 0;
  const activeSessions =
    sessions?.filter((s) => s.status === "active" || s.status === "voting")
      .length ?? 0;

  const categoryCounts = useMemo(() => {
    if (!sessions) return {};
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      if (s.status === "completed" || s.status === "archived") continue;
      const cat = getStageCategory(s.stage);
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [sessions]);

  const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts));

  // Simple activity chart bars
  const chartBars = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      day: i,
      value: Math.floor(Math.random() * 80 + 20),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSessions]);

  return (
    <>
      <div className="flex gap-8">
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-[28px] font-bold text-zinc-900">
                Dashboard
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center">
              <div className="flex -space-x-2">
                {["AC", "MJ", "TS", "BW"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-zinc-200 border-2 border-stone-50 flex items-center justify-center text-[10px] font-bold text-zinc-500"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-stone-50 flex items-center justify-center text-zinc-400">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity chart */}
          {!isLoading && sessions && sessions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Generation Activity
                </h3>
                <button className="text-zinc-400 hover:text-zinc-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-end gap-1.5 h-24">
                {chartBars.map((bar) => (
                  <div
                    key={bar.day}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${bar.value}%`,
                      backgroundColor:
                        bar.day % 3 === 0
                          ? "rgb(245, 158, 11)"
                          : "rgb(59, 130, 246)",
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-zinc-400">2 weeks ago</span>
                <span className="text-[10px] text-zinc-400">Today</span>
              </div>
            </div>
          )}

          {/* Stats pills */}
          {!isLoading && sessions && sessions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <div className="flex items-center divide-x divide-zinc-200">
                <div className="flex-1 pr-5">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">
                    {totalSessions}
                  </p>
                </div>
                <div className="flex-1 px-5">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">
                    {activeSessions}
                  </p>
                </div>
                <div className="flex-1 px-5">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">
                    {sessions?.filter((s) => s.status === "completed").length ?? 0}
                  </p>
                </div>
                <div className="flex-1 pl-5">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Avg Progress
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">
                    {totalSessions > 0
                      ? Math.round(
                          sessions!.reduce(
                            (acc, s) =>
                              acc + (s.stage / (TOTAL_STAGES - 1)) * 100,
                            0
                          ) / totalSessions
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Session list */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-500">
                Active Sessions
              </h3>
              <button className="text-zinc-400 hover:text-zinc-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl text-red-600 text-sm mb-4">
                Failed to load sessions: {error.message}
              </div>
            )}

            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SessionCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && sessions && sessions.length === 0 && (
              <EmptyState onCreateSession={() => setModalOpen(true)} />
            )}

            {!isLoading && sessions && sessions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100">
                {sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 shrink-0 hidden xl:block">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-5">
              Pipeline overview
            </h3>
            <div className="space-y-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const count = categoryCounts[key] ?? 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-zinc-900">
                        {config.label}
                      </span>
                      <span className="text-sm font-semibold text-zinc-900">
                        {count}
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          config.color
                        )}
                        style={{
                          width: `${
                            maxCategoryCount > 0
                              ? (count / maxCategoryCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
            <div className="w-12 h-12 bg-zinc-200 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-zinc-500" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 mb-1">
              Start New Character
            </h4>
            <p className="text-[13px] text-zinc-500 mb-4">
              Begin a new production pipeline for a licensed character
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 bg-zinc-900 text-white font-semibold text-sm rounded-xl hover:bg-zinc-800 transition-colors"
            >
              NEW SESSION
            </button>
          </div>
        </div>
      </div>

      <NewSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
