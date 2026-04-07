"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateUserRole } from "@/app/(admin)/admin/actions";
import type { Profile, UserRole } from "@/types/database";

const ROLES: UserRole[] = [
  "admin",
  "creative_director",
  "sculptor",
  "reviewer",
  "licensing",
  "factory_coordinator",
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  creative_director: "Creative Director",
  sculptor: "Sculptor",
  reviewer: "Reviewer",
  licensing: "Licensing",
  factory_coordinator: "Factory Coordinator",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserRowProps {
  user: Profile;
  currentUserId: string;
}

function UserRow({ user, currentUserId }: UserRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(newRole: string) {
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole as UserRole);
        toast.success(`${user.full_name}'s role updated to ${ROLE_LABELS[newRole as UserRole]}`);
      } catch {
        toast.error("Failed to update role");
      }
    });
  }

  const isSelf = user.id === currentUserId;

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{user.full_name}</p>
            {isSelf && (
              <span className="text-[10px] text-amber-600 font-medium">You</span>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-zinc-500">{user.email}</td>
      <td className="py-3 px-4">
        <Select
          defaultValue={user.role}
          onValueChange={handleRoleChange}
          disabled={isPending || isSelf}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role} className="text-xs">
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">
        {new Date(user.created_at).toLocaleDateString("en-SG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
    </tr>
  );
}

interface UsersPanelProps {
  users: Profile[];
  currentUserId: string;
}

export function UsersPanel({ users, currentUserId }: UsersPanelProps) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">{users.length} team members</p>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 w-48"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Name
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Role
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-zinc-400">
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <UserRow key={user.id} user={user} currentUserId={currentUserId} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
