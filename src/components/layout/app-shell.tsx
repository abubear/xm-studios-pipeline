"use client";

import { Sidebar } from "./sidebar";
import type { Profile } from "@/types/database";

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar profile={profile} />
      <div className="lg:pl-64 pl-0 min-h-screen p-0 lg:pt-4 lg:pr-4 lg:pb-4">
        <main className="bg-white lg:rounded-3xl lg:shadow-2xl min-h-[calc(100vh-2rem)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
