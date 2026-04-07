export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-1">
          <div className="h-6 w-20 bg-zinc-100 rounded" />
          <div className="h-4 w-40 bg-zinc-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-zinc-100 rounded-lg" />
      </div>

      {/* Session cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-5 space-y-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                <div className="h-3 bg-zinc-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-px bg-zinc-50" />
            <div className="flex items-center justify-between">
              <div className="h-3 bg-zinc-100 rounded w-20" />
              <div className="h-5 w-16 bg-zinc-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
