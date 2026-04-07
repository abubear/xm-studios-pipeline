export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* TopBar skeleton */}
      <div className="h-14 border-b border-zinc-100 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-40 bg-zinc-100 rounded" />
          <div className="h-5 w-16 bg-zinc-100 rounded-full" />
        </div>
        <div className="h-4 w-24 bg-zinc-100 rounded" />
      </div>

      {/* Content: left config + right status */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 space-y-5">
          <div className="h-5 w-32 bg-zinc-100 rounded" />
          {/* Reference image */}
          <div className="w-full max-w-sm h-64 bg-zinc-100 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-100 rounded" />
            <div className="h-24 bg-zinc-100 rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-zinc-100 rounded-lg" />
        </div>
        <div className="w-72 border-l border-zinc-100 p-5 space-y-4 hidden lg:block">
          <div className="h-4 w-28 bg-zinc-100 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-zinc-100 rounded" />
              <div className="h-8 bg-zinc-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
