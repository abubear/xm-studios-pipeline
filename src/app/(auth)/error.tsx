"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-[420px] text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-zinc-900 rounded-2xl p-5">
            <AlertCircle className="w-8 h-8 text-zinc-500" />
          </div>
        </div>
        <h2 className="font-heading font-semibold text-zinc-100">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-500">{error.message}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/login"
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
