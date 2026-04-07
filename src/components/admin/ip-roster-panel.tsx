"use client";

import { Image as ImageIcon, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { IPRoster } from "@/types/database";

interface IPRosterPanelProps {
  ipRoster: IPRoster[];
}

export function IPRosterPanel({ ipRoster }: IPRosterPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">{ipRoster.length} IP properties</p>
        <button
          disabled
          title="Coming soon"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-400 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <PlusCircle className="w-4 h-4" />
          Add IP
        </button>
      </div>
      {ipRoster.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl shadow-sm border border-zinc-100">
          <ImageIcon className="w-8 h-8 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-400">No IP properties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ipRoster.map((ip) => (
            <div
              key={ip.id}
              className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden"
            >
              <div className="h-28 bg-zinc-50 flex items-center justify-center">
                {ip.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ip.thumbnail_url}
                    alt={ip.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-zinc-900">
                      {ip.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{ip.universe}</p>
                  </div>
                  <StatusBadge status={ip.status} />
                </div>
                {ip.description && (
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                    {ip.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
