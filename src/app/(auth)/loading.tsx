export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-[420px] animate-pulse space-y-6 px-4">
        {/* Logo area */}
        <div className="text-center space-y-2">
          <div className="h-9 w-32 bg-zinc-800 rounded mx-auto" />
          <div className="h-3 w-40 bg-zinc-800 rounded mx-auto" />
        </div>
        {/* Card */}
        <div className="bg-zinc-900/60 rounded-2xl p-8 space-y-5">
          <div className="h-6 w-48 bg-zinc-800 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-11 bg-zinc-800 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-11 bg-zinc-800 rounded-lg" />
          </div>
          <div className="h-11 bg-zinc-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
