export default function Loading() {
  return (
    <div className="flex h-full animate-pulse">
      {/* Left input panel */}
      <div className="w-80 border-r border-zinc-100 p-5 space-y-5 shrink-0">
        <div className="h-5 w-36 bg-zinc-100 rounded" />
        {/* Image upload area */}
        <div className="h-36 bg-zinc-100 rounded-xl" />
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-100 rounded" />
          <div className="h-20 bg-zinc-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-zinc-100 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-16 bg-zinc-100 rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-10 bg-zinc-100 rounded-lg" />
      </div>

      {/* Right results panel */}
      <div className="flex-1 p-5 space-y-4">
        <div className="h-5 w-24 bg-zinc-100 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
