"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";

interface TopBarProps {
  title: string;
  children?: React.ReactNode;
}

export function TopBar({ title, children }: TopBarProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header className="h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg font-semibold text-zinc-900">
          {title}
        </h1>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
