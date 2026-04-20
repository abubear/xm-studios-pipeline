"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { JuryImage } from "@/types/jury";

interface Voter {
  user_id: string;
  vote: string;
  full_name: string;
  avatar_url: string | null;
}

interface ExpandedCardProps {
  images: JuryImage[];
  selectedIndex: number;
  onVote: (imageId: string, vote: "approve" | "reject") => void;
  onUndo: () => void;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ExpandedCard({
  images,
  selectedIndex,
  onVote,
  onUndo,
  onClose,
  onNavigate,
}: ExpandedCardProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const image = images[selectedIndex];

  // Keyboard shortcuts — only active in expanded mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          if (image) onVote(image.id, "approve");
          break;
        case "r":
          e.preventDefault();
          if (image) onVote(image.id, "reject");
          break;
        case " ":
          e.preventDefault();
          // Skip to next
          if (selectedIndex < images.length - 1)
            onNavigate(selectedIndex + 1);
          break;
        case "arrowleft":
          e.preventDefault();
          if (selectedIndex > 0) onNavigate(selectedIndex - 1);
          break;
        case "arrowright":
          e.preventDefault();
          if (selectedIndex < images.length - 1)
            onNavigate(selectedIndex + 1);
          break;
        case "z":
          e.preventDefault();
          onUndo();
          break;
        case "escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [image, selectedIndex, images.length, onVote, onUndo, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Fetch voters for the selected image
  useEffect(() => {
    if (!image) return;
    const supabase = createClient();
    supabase
      .from("votes")
      .select("user_id, vote, profiles(full_name, avatar_url)")
      .eq("generated_image_id", image.id)
      .then(({ data }) => {
        const mapped = (data ?? []).map((v: Record<string, unknown>) => {
          const profile = v.profiles as {
            full_name: string;
            avatar_url: string | null;
          } | null;
          return {
            user_id: v.user_id as string,
            vote: v.vote as string,
            full_name: profile?.full_name ?? "Unknown",
            avatar_url: profile?.avatar_url ?? null,
          };
        });
        setVoters(mapped);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image?.id, image?.approve_count, image?.reject_count]);

  if (!image) return null;

  const score = image.approve_count - image.reject_count;
  const rawAesthetic = (
    image.metadata as Record<string, unknown> | undefined
  )?.aesthetic_score;
  const aestheticScore = typeof rawAesthetic === "number" ? rawAesthetic : null;

  return (
    <AnimatePresence>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        layoutId={`card-${image.id}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left column — image + prompt + metadata */}
          <div className="w-3/5 flex flex-col">
            {/* Image */}
            <div className="bg-zinc-100 flex items-center justify-center min-h-[300px] max-h-[50vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`Concept #${image.id.slice(0, 6)}`}
                className="w-full h-full object-contain max-h-[50vh]"
              />
            </div>

            {/* Prompt + metadata */}
            <div className="p-5 overflow-y-auto flex-1">
              {image.prompt && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Prompt
                  </p>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {image.prompt}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {image.seed !== null && (
                  <div>
                    <span className="text-zinc-400">Seed</span>
                    <p className="text-zinc-600 font-mono">{image.seed}</p>
                  </div>
                )}
                <div>
                  <span className="text-zinc-400">Workflow</span>
                  <p className="text-zinc-600">{image.workflow}</p>
                </div>
                {image.width && image.height && (
                  <div>
                    <span className="text-zinc-400">Size</span>
                    <p className="text-zinc-600 font-mono">
                      {image.width}x{image.height}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-zinc-400">Created</span>
                  <p className="text-zinc-600">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — voting + team votes */}
          <div className="w-2/5 border-l border-zinc-100 flex flex-col">
            <div className="p-5 flex-1 overflow-y-auto">
              {/* Title */}
              <h2 className="text-xl font-bold text-zinc-900">
                Concept #{image.id.slice(0, 6)}
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                {image.workflow}
              </p>

              {/* Stat pills */}
              <div className="flex items-center mt-4 rounded-xl bg-zinc-50 overflow-hidden">
                <div className="flex-1 py-2 px-3 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Score
                  </p>
                  <p className="text-lg font-bold text-zinc-900">
                    {score > 0 ? "+" : ""}
                    {score}
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-200" />
                <div className="flex-1 py-2 px-3 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Aesthetic
                  </p>
                  <p className="text-lg font-bold text-zinc-900">
                    {aestheticScore?.toFixed(1) ?? "—"}
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-200" />
                <div className="flex-1 py-2 px-3 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Votes
                  </p>
                  <p className="text-lg font-bold text-zinc-900">
                    {image.approve_count + image.reject_count}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-zinc-100 my-5" />

              {/* Voting section */}
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Cast your vote
              </p>

              {image.my_vote ? (
                <div className="space-y-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold",
                      image.my_vote === "approve"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    )}
                  >
                    {image.my_vote === "approve" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    You {image.my_vote === "approve" ? "approved" : "rejected"}{" "}
                    this image
                  </div>
                  <button
                    onClick={onUndo}
                    className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    Change vote
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => onVote(image.id, "approve")}
                    className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => onVote(image.id, "reject")}
                    className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      if (selectedIndex < images.length - 1)
                        onNavigate(selectedIndex + 1);
                    }}
                    className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    Skip →
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-zinc-100 my-5" />

              {/* Team votes */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Team votes
                </p>
                <span className="text-xs text-zinc-400">
                  {voters.length} voted
                </span>
              </div>

              {voters.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {voters.map((v) => (
                    <motion.div
                      key={v.user_id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                        {v.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <span className="text-sm text-zinc-900 flex-1 truncate">
                        {v.full_name}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          v.vote === "approve"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        )}
                      >
                        {v.vote === "approve" ? "Approved" : "Rejected"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No votes yet</p>
              )}
            </div>

            {/* Navigation footer */}
            <div className="border-t border-zinc-100 px-5 py-3 flex items-center justify-between">
              <button
                onClick={() =>
                  selectedIndex > 0 && onNavigate(selectedIndex - 1)
                }
                disabled={selectedIndex === 0}
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm text-zinc-400">
                {selectedIndex + 1} of {images.length}
              </span>

              <button
                onClick={() =>
                  selectedIndex < images.length - 1 &&
                  onNavigate(selectedIndex + 1)
                }
                disabled={selectedIndex >= images.length - 1}
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
