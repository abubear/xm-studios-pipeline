export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-1">
        <div className="h-6 w-28 bg-zinc-100 rounded" />
        <div className="h-4 w-52 bg-zinc-100 rounded" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-zinc-100 pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-zinc-100 rounded-t-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-zinc-100">
          {[40, 28, 20, 12].map((w, i) => (
            <div key={i} className={`h-3 bg-zinc-100 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-zinc-50 last:border-0">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-zinc-100 shrink-0" />
              <div className="space-y-1">
                <div className="h-3.5 w-28 bg-zinc-100 rounded" />
                <div className="h-3 w-36 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="h-5 w-24 bg-zinc-100 rounded-full" />
            <div className="h-3 w-20 bg-zinc-100 rounded" />
            <div className="h-8 w-8 bg-zinc-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
