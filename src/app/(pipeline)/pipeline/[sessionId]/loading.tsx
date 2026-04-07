export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* TopBar skeleton */}
      <div className="h-14 border-b border-zinc-100 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-44 bg-zinc-100 rounded" />
          <div className="h-5 w-16 bg-zinc-100 rounded-full" />
        </div>
        <div className="h-4 w-24 bg-zinc-100 rounded" />
      </div>

      {/* Content area */}
      <div className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-40 bg-zinc-100 rounded" />
            <div className="h-3 w-56 bg-zinc-100 rounded" />
          </div>
          <div className="h-9 w-36 bg-zinc-100 rounded-lg" />
        </div>

        {/* Image grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
