import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="font-heading text-xl font-semibold text-zinc-900 mb-2">
        {title}
      </h2>
      <p className="text-zinc-500 max-w-md mb-6">{description}</p>
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
