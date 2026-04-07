"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  User,
  Calendar,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-sessions";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline-stages";
import { formatDistanceToNow, format } from "date-fns";

interface SessionDetailContentProps {
  sessionId: string;
}

export function SessionDetailContent({
  sessionId,
}: SessionDetailContentProps) {
  const router = useRouter();
  const { data: session, isLoading, error } = useSession(sessionId);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3 mb-8">
          <div className="h-4 w-20 bg-zinc-100 rounded" />
          <div className="h-7 w-64 bg-zinc-100 rounded" />
          <div className="h-4 w-40 bg-zinc-100 rounded" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-2xl shadow-sm animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-white rounded-2xl shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">
            {error?.message ?? "Session not found"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const universe = session.ip_roster?.universe ?? "Unknown";
  const timeAgo = formatDistanceToNow(new Date(session.updated_at), {
    addSuffix: true,
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-zinc-900">
              {session.name}
            </h1>
            <p className="text-zinc-400 mt-1 text-sm flex items-center gap-2">
              <span>{session.ip_roster?.name}</span>
              <span className="text-zinc-300">·</span>
              <span>{universe}</span>
              <span className="text-zinc-300">·</span>
              <span>Updated {timeAgo}</span>
            </p>
          </div>
          <span
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full capitalize shrink-0",
              session.status === "active"
                ? "bg-amber-50 text-amber-700"
                : session.status === "voting"
                  ? "bg-purple-50 text-purple-700"
                  : session.status === "completed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500"
            )}
          >
            {session.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Production Timeline
          </h2>
          <div className="space-y-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const isCompleted = stage.id < session.stage;
              const isCurrent = stage.id === session.stage;
              const isFuture = stage.id > session.stage;
              const link = stage.href(session.id);
              const isGate = !!stage.gate;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl transition-all",
                      isCurrent
                        ? "bg-amber-50 shadow-sm"
                        : isCompleted
                          ? "bg-white shadow-sm"
                          : "bg-zinc-50"
                    )}
                  >
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                      ) : isGate ? (
                        <Lock className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-mono",
                            isCurrent
                              ? "text-amber-600"
                              : isCompleted
                                ? "text-zinc-400"
                                : "text-zinc-300"
                          )}
                        >
                          {stage.id.toString().padStart(2, "0")}
                        </span>
                        <h3
                          className={cn(
                            "font-medium text-sm",
                            isCurrent
                              ? "text-amber-700"
                              : isCompleted
                                ? "text-zinc-900"
                                : "text-zinc-400"
                          )}
                        >
                          {stage.name}
                        </h3>
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          isFuture ? "text-zinc-300" : "text-zinc-400"
                        )}
                      >
                        {stage.description}
                      </p>
                    </div>

                    {link && !isFuture && stage.app && !isCurrent && (
                      <Link
                        href={link}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors shrink-0"
                      >
                        {stage.app}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {isCurrent && link && stage.app && (
                      <Link
                        href={link}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-500 hover:bg-amber-400 text-white transition-colors shrink-0"
                      >
                        Open {stage.app}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Session Info
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <dt className="text-[10px] text-zinc-400 uppercase">
                    Created
                  </dt>
                  <dd className="text-sm text-zinc-900">
                    {format(new Date(session.created_at), "MMM d, yyyy")}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <dt className="text-[10px] text-zinc-400 uppercase">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-zinc-900">
                    {format(
                      new Date(session.updated_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <dt className="text-[10px] text-zinc-400 uppercase">
                    Current Stage
                  </dt>
                  <dd className="text-sm text-zinc-900">
                    Stage {session.stage.toString().padStart(2, "0")}:{" "}
                    {PIPELINE_STAGES[session.stage]?.shortName}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {session.ip_roster && (
            <div className="p-5 bg-white rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Character
              </h3>
              <div className="space-y-2">
                <p className="font-heading font-semibold text-zinc-900">
                  {session.ip_roster.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {session.ip_roster.universe}
                </p>
                {session.ip_roster.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {session.ip_roster.description}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-5 bg-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Completion</span>
                <span className="text-zinc-900 font-medium">
                  {Math.round((session.stage / 13) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(session.stage / 13) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                {session.stage} of 14 stages completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
