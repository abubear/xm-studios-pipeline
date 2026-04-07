import { SessionCardSkeleton } from "@/components/dashboard/session-card-skeleton";

export default function Loading() {
  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header skeleton */}
        <div className="space-y-1 animate-pulse">
          <div className="h-7 w-36 bg-zinc-100 rounded" />
          <div className="h-4 w-52 bg-zinc-100 rounded" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
              <div className="h-3 w-20 bg-zinc-100 rounded" />
              <div className="h-7 w-10 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>

        {/* Session list skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-28 bg-zinc-100 rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="w-64 border-l border-zinc-100 p-5 space-y-4 animate-pulse hidden lg:block">
        <div className="h-4 w-24 bg-zinc-100 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-24 bg-zinc-100 rounded" />
            <div className="h-3 w-6 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
