"use client";

import {
  Columns3,
  Columns4,
  Grid3X3,
  ArrowUpDown,
  CheckCheck,
  Download,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJuryStore } from "@/hooks/use-jury-store";
import type { JuryFilter, JurySort, GridDensity } from "@/types/jury";

interface ToolbarProps {
  sessionId: string;
  total: number;
  voted: number;
  onBulkApprove: () => void;
  bulkPending: boolean;
}

const filterOptions: { value: JuryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unvoted", label: "Unvoted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const sortOptions: { value: JurySort; label: string }[] = [
  { value: "id", label: "Image ID" },
  { value: "vote_score", label: "Vote Score" },
  { value: "ai_score", label: "AI Score" },
];

const densityOptions: { value: GridDensity; label: string; Icon: typeof Grid3X3 }[] = [
  { value: "3", label: "3 columns", Icon: Columns3 },
  { value: "4", label: "4 columns", Icon: Columns4 },
  { value: "5", label: "5 columns", Icon: Grid3X3 },
];

export function Toolbar({
  sessionId,
  total,
  voted,
  onBulkApprove,
  bulkPending,
}: ToolbarProps) {
  const density = useJuryStore((s) => s.density);
  const filter = useJuryStore((s) => s.filter);
  const sort = useJuryStore((s) => s.sort);
  const setDensity = useJuryStore((s) => s.setDensity);
  const setFilter = useJuryStore((s) => s.setFilter);
  const setSort = useJuryStore((s) => s.setSort);
  const toggleHelp = useJuryStore((s) => s.toggleHelp);

  const progress = total > 0 ? Math.round((voted / total) * 100) : 0;

  return (
    <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all",
                filter === opt.value
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-zinc-200 shrink-0" />

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as JurySort)}
            className="bg-zinc-100 text-zinc-600 text-xs rounded-xl px-3 py-1.5 border-0 focus-ring"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Density toggle */}
        <div className="flex items-center bg-zinc-100 rounded-xl p-0.5">
          {densityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDensity(opt.value)}
              title={opt.label}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                density === opt.value
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <opt.Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={onBulkApprove}
          disabled={bulkPending}
          title="Approve all visible"
          className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Approve All
        </button>

        <a
          href={`/api/sessions/${sessionId}/export`}
          download
          title="Export CSV"
          className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </a>

        <button
          onClick={toggleHelp}
          title="Keyboard shortcuts (?)"
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-3 flex items-center gap-3">
        <span className="text-[13px] text-zinc-400">
          {voted} of {total} reviewed
        </span>
        <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
