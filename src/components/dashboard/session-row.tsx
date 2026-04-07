"use client";

import Link from "next/link";
import {
  Paintbrush,
  Vote,
  ShieldCheck,
  Hammer,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStageName } from "@/lib/constants/pipeline-stages";
import { formatDistanceToNow } from "date-fns";
import type { SessionWithIP } from "@/hooks/use-sessions";

function getStageIcon(stage: number) {
  if (stage <= 3) return { Icon: Paintbrush, bg: "bg-blue-100", color: "text-blue-600" };
  if (stage === 4 || stage === 7) return { Icon: ShieldCheck, bg: "bg-rose-100", color: "text-rose-600" };
  if (stage === 5 || stage === 6) return { Icon: Vote, bg: "bg-amber-100", color: "text-amber-700" };
  if (stage >= 8 && stage <= 11) return { Icon: Hammer, bg: "bg-green-100", color: "text-green-600" };
  return { Icon: Package, bg: "bg-teal-100", color: "text-teal-600" };
}

export function SessionRow({ session }: { session: SessionWithIP }) {
  const characterName = session.ip_roster?.name ?? "Unknown IP";
  const stageName = getStageName(session.stage);
  const { Icon, bg, color } = getStageIcon(session.stage);
  const timeAgo = formatDistanceToNow(new Date(session.updated_at), {
    addSuffix: true,
  });
  const stageLabel = `Stage ${String(session.stage).padStart(2, "0")}`;

  return (
    <Link
      href={`/dashboard/${session.id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer"
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          bg
        )}
      >
        <Icon className={cn("w-5 h-5", color)} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-zinc-900 truncate">
          {characterName}
        </p>
        <p className="text-[13px] text-zinc-400 truncate">
          {timeAgo} · {stageName}
        </p>
      </div>

      {/* Stage number */}
      <span className="text-sm font-semibold text-zinc-900 shrink-0">
        {stageLabel}
      </span>
    </Link>
  );
}
