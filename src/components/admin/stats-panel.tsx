interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

function StatCard({ label, value, color = "text-zinc-900" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`font-heading text-4xl font-bold ${color}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

interface StatsPanelProps {
  totalSessions: number;
  activeSessions: number;
  totalGeneratedImages: number;
  totalVotes: number;
  totalFinalists: number;
  publishedPackages: number;
}

export function StatsPanel({
  totalSessions,
  activeSessions,
  totalGeneratedImages,
  totalVotes,
  totalFinalists,
  publishedPackages,
}: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard label="Total Sessions" value={totalSessions} />
      <StatCard
        label="Active Sessions"
        value={activeSessions}
        color="text-amber-600"
      />
      <StatCard label="Generated Images" value={totalGeneratedImages} />
      <StatCard label="Total Votes" value={totalVotes} />
      <StatCard
        label="Finalists Selected"
        value={totalFinalists}
        color="text-emerald-600"
      />
      <StatCard
        label="Published Packages"
        value={publishedPackages}
        color="text-teal-600"
      />
    </div>
  );
}
