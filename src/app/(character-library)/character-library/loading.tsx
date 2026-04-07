export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Search + filter bar */}
      <div className="p-4 border-b border-zinc-100 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-zinc-100 rounded-lg" />
          <div className="h-10 w-32 bg-zinc-100 rounded-lg" />
        </div>
        {/* Format filter pills */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-12 bg-zinc-100 rounded-full" />
          ))}
        </div>
        {/* Tag filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-zinc-100 rounded-full" />
          ))}
        </div>
      </div>

      {/* Model cards grid */}
      <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-square bg-zinc-100" />
            <div className="p-3 space-y-1.5">
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
