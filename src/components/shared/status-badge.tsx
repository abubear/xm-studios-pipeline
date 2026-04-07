import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-amber-50 text-amber-600",
  voting: "bg-purple-50 text-purple-600",
  completed: "bg-emerald-50 text-emerald-600",
  draft: "bg-zinc-100 text-zinc-500",
  archived: "bg-zinc-100 text-zinc-400",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-50 text-red-600",
  pending: "bg-zinc-100 text-zinc-500",
  generating: "bg-blue-50 text-blue-600",
  published: "bg-teal-50 text-teal-600",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-500";
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded text-[10px] font-medium capitalize",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}
