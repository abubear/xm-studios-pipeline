"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  X,
  Menu,
  LayoutDashboard,
  Search,
  Sparkles,
  Vote,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  ClipboardCheck,
  RotateCcw,
  Box,
  Wrench,
  Factory,
  Library,
  Store,
  Settings,
  Unplug,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useComfyUIStatus } from "@/hooks/use-comfyui-status";
import type { Profile } from "@/types/database";

// ============================================================
// Navigation structures
// ============================================================

interface NavItem {
  label: string;
  href: string | ((sessionId: string) => string);
  icon: LucideIcon;
  roles?: string[];
}

/** Web apps — always available, no ComfyUI dependency */
const webAppItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scene Composer", href: "/scene-composer", icon: Search },
  { label: "Jury", href: "/jury", icon: Vote },
  { label: "Imagination Studio", href: "/imagination-studio", icon: Sparkles },
  { label: "Character Library", href: "/character-library", icon: Library },
  { label: "Store Content", href: "/store-content", icon: Store },
  { label: "Admin", href: "/admin", icon: Settings, roles: ["admin"] },
];

interface ComfyNavGroup {
  groupLabel: string;
  items: NavItem[];
}

/** ComfyUI pipeline stages — require ViewComfy connection */
const comfyuiGroups: ComfyNavGroup[] = [
  {
    groupLabel: "Generation",
    items: [
      {
        label: "Mass Generation",
        href: (sid) => `/generation/${sid}`,
        icon: Sparkles,
      },
      {
        label: "Auto Filter",
        href: (sid) => `/generation/${sid}/filter`,
        icon: ClipboardCheck,
      },
    ],
  },
  {
    groupLabel: "3D Pipeline",
    items: [
      {
        label: "Turnarounds",
        href: (sid) => `/pipeline/${sid}/turnaround`,
        icon: RotateCcw,
      },
      {
        label: "3D Generation",
        href: (sid) => `/pipeline/${sid}/3d`,
        icon: Box,
      },
      {
        label: "Auto-Rigging",
        href: (sid) => `/pipeline/${sid}/3d`,
        icon: Wrench,
      },
    ],
  },
  {
    groupLabel: "Production",
    items: [
      {
        label: "IP Gate 2",
        href: "/jury",
        icon: ShieldAlert,
      },
      {
        label: "Factory Package",
        href: (sid) => `/pipeline/${sid}/factory`,
        icon: Factory,
      },
    ],
  },
];

// ============================================================
// Helpers
// ============================================================

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function resolveHref(
  href: string | ((sid: string) => string),
  sessionId: string | null
): string {
  if (typeof href === "function") {
    return sessionId ? href(sessionId) : "#";
  }
  return href;
}

// ============================================================
// Component
// ============================================================

interface SidebarProps {
  profile: Profile;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const { mobileOpen, closeMobile, toggleMobile } = useSidebar();
  const comfyConnected = useComfyUIStatus();

  const sessionId = (params?.sessionId as string) ?? null;

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href))
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User profile */}
      <div className="px-5 pt-7 pb-5">
        <div className="relative inline-block">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              getInitials(profile.full_name)
            )}
          </div>
        </div>
        <p className="text-white font-semibold text-sm mt-2">
          {profile.full_name}
        </p>
        <p className="text-zinc-500 text-xs mt-0.5">{profile.email}</p>
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {/* ── Web Apps ── */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 px-2">
          Web Apps
        </p>
        {webAppItems
          .filter(
            (item) => !item.roles || item.roles.includes(profile.role)
          )
          .map((item) => {
            const href = resolveHref(item.href, sessionId);
            const active = isActive(href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-2.5 py-2 px-2 rounded-lg text-[13px] transition-colors",
                  active
                    ? "text-white font-semibold bg-zinc-800/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </Link>
            );
          })}

        {/* Divider */}
        <div className="h-px bg-zinc-800 my-3" />

        {/* ── ComfyUI Pipeline ── */}
        <div className="flex items-center gap-2 mb-1 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            ComfyUI Pipeline
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full",
              comfyConnected
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            <Unplug className="w-2.5 h-2.5" />
            {comfyConnected ? "Live" : "Offline"}
          </span>
        </div>

        {comfyuiGroups.map((group) => (
          <div key={group.groupLabel} className="mb-3">
            <p className="text-[10px] font-medium text-zinc-600 mb-0.5 px-2 mt-2">
              {group.groupLabel}
            </p>
            {group.items.map((item) => {
              const href = resolveHref(item.href, sessionId);
              const active = isActive(href);
              const disabled = !comfyConnected;
              const Icon = item.icon;

              if (disabled) {
                return (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    className="flex items-center gap-2.5 py-2 px-2 rounded-lg text-[13px] text-zinc-600 cursor-not-allowed opacity-50"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-2.5 py-2 px-2 rounded-lg text-[13px] transition-colors",
                    active
                      ? "text-white font-semibold bg-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-5 pb-5">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 transition-colors py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-zinc-900 text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 overflow-hidden bg-zinc-950">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-zinc-950 rounded-r-2xl z-50 lg:hidden"
            >
              <button
                onClick={closeMobile}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
