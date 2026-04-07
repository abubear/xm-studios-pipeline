"use client";

import { Layers } from "lucide-react";

interface EmptyStateProps {
  onCreateSession: () => void;
}

export function EmptyState({ onCreateSession }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-6">
        <Layers className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="font-heading text-xl font-semibold text-zinc-900 mb-2">
        No production sessions yet
      </h2>
      <p className="text-zinc-500 max-w-sm mb-6">
        Start your first session by selecting a character from the IP roster and
        begin the production pipeline.
      </p>
      <button
        onClick={onCreateSession}
        className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors"
      >
        Create First Session
      </button>
    </div>
  );
}
