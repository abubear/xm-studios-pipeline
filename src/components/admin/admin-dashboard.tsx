"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersPanel } from "./users-panel";
import { IPRosterPanel } from "./ip-roster-panel";
import { StyleRulesPanel } from "./style-rules-panel";
import { StatsPanel } from "./stats-panel";
import type { Profile, IPRoster, StyleGuideRule } from "@/types/database";

interface AdminDashboardProps {
  currentUserId: string;
  users: Profile[];
  ipRoster: IPRoster[];
  styleRules: StyleGuideRule[];
  stats: {
    totalSessions: number;
    activeSessions: number;
    totalGeneratedImages: number;
    totalVotes: number;
    totalFinalists: number;
    publishedPackages: number;
  };
}

export function AdminDashboard({
  currentUserId,
  users,
  ipRoster,
  styleRules,
  stats,
}: AdminDashboardProps) {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="users">
          Users <span className="ml-1.5 text-[10px] bg-zinc-100 text-zinc-500 rounded-full px-1.5 py-0.5">{users.length}</span>
        </TabsTrigger>
        <TabsTrigger value="ip-roster">
          IP Roster <span className="ml-1.5 text-[10px] bg-zinc-100 text-zinc-500 rounded-full px-1.5 py-0.5">{ipRoster.length}</span>
        </TabsTrigger>
        <TabsTrigger value="style-rules">
          Style Rules <span className="ml-1.5 text-[10px] bg-zinc-100 text-zinc-500 rounded-full px-1.5 py-0.5">{styleRules.length}</span>
        </TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UsersPanel users={users} currentUserId={currentUserId} />
      </TabsContent>

      <TabsContent value="ip-roster">
        <IPRosterPanel ipRoster={ipRoster} />
      </TabsContent>

      <TabsContent value="style-rules">
        <StyleRulesPanel rules={styleRules} />
      </TabsContent>

      <TabsContent value="stats">
        <StatsPanel {...stats} />
      </TabsContent>
    </Tabs>
  );
}
