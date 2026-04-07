"use client";

import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-8">
      <div className="bg-zinc-100 rounded-2xl p-5">
        <AlertCircle className="w-8 h-8 text-zinc-400" />
      </div>
      <div className="text-center">
        <h2 className="font-heading font-semibold text-zinc-900 mb-1">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm">{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
