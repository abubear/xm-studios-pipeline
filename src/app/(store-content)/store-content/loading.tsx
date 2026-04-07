export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-1">
          <div className="h-6 w-32 bg-zinc-100 rounded" />
          <div className="h-4 w-48 bg-zinc-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-zinc-100 rounded-lg" />
      </div>

      {/* Content cards with image preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
          >
            {/* Image placeholder */}
            <div className="w-full h-40 bg-zinc-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 w-16 bg-zinc-100 rounded-full" />
                <div className="h-3 w-20 bg-zinc-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
