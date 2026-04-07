"use client";

export function SessionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-zinc-100 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-32 bg-zinc-100 rounded" />
          <div className="h-3 w-48 bg-zinc-100 rounded" />
        </div>
        <div className="h-4 w-16 bg-zinc-100 rounded shrink-0" />
      </div>
    </div>
  );
}
