"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStageName, PIPELINE_STAGES } from "@/lib/constants/pipeline-stages";
import { formatDistanceToNow } from "date-fns";
import type { SessionWithIP } from "@/hooks/use-sessions";
import { ArrowRight } from "lucide-react";

const universeColors: Record<
  string,
  { bg: string; text: string; border: string; icon: string }
> = {
  Marvel: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: "bg-red-500/20 text-red-400",
  },
  DC: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: "bg-blue-500/20 text-blue-400",
  },
  "Star Wars": {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    icon: "bg-yellow-500/20 text-yellow-400",
  },
};

const defaultUniverseColor = {
  bg: "bg-zinc-500/15",
  text: "text-zinc-400",
  border: "border-zinc-500/20",
  icon: "bg-zinc-500/20 text-zinc-400",
};

const statusColors: Record<string, string> = {
  draft: "bg-zinc-700/50 text-zinc-400",
  active: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  voting: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  archived: "bg-zinc-700/30 text-zinc-500",
};

const TOTAL_STAGES = PIPELINE_STAGES.length;

export function SessionCard({ session }: { session: SessionWithIP }) {
  const universe = session.ip_roster?.universe ?? "Unknown";
  const colors = universeColors[universe] ?? defaultUniverseColor;
  const statusColor = statusColors[session.status] ?? statusColors.draft;
  const characterName = session.ip_roster?.name ?? "Unknown IP";
  const initials = characterName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const progress = Math.round((session.stage / (TOTAL_STAGES - 1)) * 100);
  const timeAgo = formatDistanceToNow(new Date(session.updated_at), {
    addSuffix: true,
  });

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-200">
      {/* Top section: universe icon + character info */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3.5">
          {/* Universe initials block */}
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
              colors.icon
            )}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-bold text-zinc-100 group-hover:text-amber-500 transition-colors truncate leading-tight">
              {characterName}
            </h3>
            <span
              className={cn(
                "inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
                colors.bg,
                colors.text,
                colors.border
              )}
            >
              {universe}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: session name + description */}
      <div className="px-5 pb-3">
        <p className="text-sm font-medium text-zinc-300 truncate">
          {session.name}
        </p>
        <p className="text-xs text-zinc-600 mt-0.5">Updated {timeAgo}</p>
      </div>

      {/* Stats row */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-zinc-800/60 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Stage
            </p>
            <p className="text-lg font-bold text-zinc-100 leading-tight mt-0.5">
              {session.stage}
              <span className="text-xs font-normal text-zinc-600">
                /{TOTAL_STAGES - 1}
              </span>
            </p>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">
              {getStageName(session.stage)}
            </p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Progress
            </p>
            <p className="text-lg font-bold text-amber-500 leading-tight mt-0.5">
              {progress}
              <span className="text-xs font-normal text-zinc-600">%</span>
            </p>
            <div className="mt-1.5 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500/80 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: status badge + open link */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <span
          className={cn(
            "px-2.5 py-1 text-[10px] font-semibold rounded-full capitalize tracking-wide",
            statusColor
          )}
        >
          {session.status}
        </span>
        <Link
          href={`/dashboard/${session.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-500 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          Open
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
