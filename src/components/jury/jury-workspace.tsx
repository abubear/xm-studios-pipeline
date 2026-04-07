"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Loader2, Sparkles, PartyPopper, ImageOff } from "lucide-react";
import { useJuryImages, useCastVote, useUndoVote, useBulkApprove } from "@/hooks/use-jury";
import { useJuryStore } from "@/hooks/use-jury-store";
import { useJuryRealtime } from "@/hooks/use-jury-realtime";
import { Toolbar } from "./toolbar";
import { ImageGrid } from "./image-grid";
import { ExpandedCard } from "./expanded-card";
import { KeyboardHelp } from "./keyboard-help";
import { ConnectionBanner } from "./connection-banner";

interface JuryWorkspaceProps {
  sessionId: string;
  sessionName: string;
}

export function JuryWorkspace({ sessionId }: JuryWorkspaceProps) {
  const { data, isLoading, error } = useJuryImages(sessionId);
  const castVote = useCastVote(sessionId);
  const undoVoteMutation = useUndoVote(sessionId);
  const bulkApprove = useBulkApprove(sessionId);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const popUndo = useJuryStore((s) => s.popUndo);

  const images = useMemo(() => data?.images ?? [], [data?.images]);
  const total = data?.total ?? 0;
  const voted = data?.voted ?? 0;

  // Real-time sync
  const imageIds = useMemo(() => images.map((i) => i.id), [images]);
  useJuryRealtime(sessionId, imageIds);

  const handleVote = useCallback(
    (imageId: string, vote: "approve" | "reject") => {
      castVote.mutate({ imageId, vote });
    },
    [castVote]
  );

  const handleUndo = useCallback(() => {
    const entry = popUndo();
    if (!entry) return;
    if (entry.previousVote === null) {
      undoVoteMutation.mutate({ imageId: entry.imageId });
    } else {
      castVote.mutate({ imageId: entry.imageId, vote: entry.previousVote });
    }
  }, [popUndo, undoVoteMutation, castVote]);

  const handleBulkApprove = useCallback(() => {
    if (!confirmBulk) {
      setConfirmBulk(true);
      setTimeout(() => setConfirmBulk(false), 3000);
      return;
    }
    const unvotedIds = images
      .filter((i) => !i.my_vote)
      .map((i) => i.id);
    if (unvotedIds.length > 0) {
      bulkApprove.mutate(unvotedIds);
    }
    setConfirmBulk(false);
  }, [confirmBulk, images, bulkApprove]);

  const handleCardClick = useCallback((index: number) => {
    setExpandedIndex(index);
  }, []);

  const handleCloseExpanded = useCallback(() => {
    setExpandedIndex(null);
  }, []);

  const handleNavigate = useCallback((index: number) => {
    setExpandedIndex(index);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm text-zinc-400">Loading images...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ImageOff className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  // Empty state
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles className="w-12 h-12 text-amber-500/50" />
        </motion.div>
        <h2 className="font-heading text-lg font-semibold text-zinc-900">
          Waiting for generation...
        </h2>
        <p className="text-sm text-zinc-400 max-w-md text-center">
          Images will appear here once the Imagination Studio generates them for
          this session.
        </p>
      </div>
    );
  }

  // All reviewed
  if (voted === total && images.length === 0) {
    return (
      <>
        <Toolbar
          sessionId={sessionId}
          total={total}
          voted={voted}
          onBulkApprove={handleBulkApprove}
          bulkPending={bulkApprove.isPending}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <PartyPopper className="w-14 h-14 text-amber-500" />
          </motion.div>
          <h2 className="font-heading text-xl font-bold text-zinc-900">
            All reviewed!
          </h2>
          <p className="text-sm text-zinc-400">
            You&apos;ve reviewed all {total} images. Switch filters to revisit.
          </p>
        </div>
      </>
    );
  }

  return (
    <LayoutGroup>
      <ConnectionBanner />
      <Toolbar
        sessionId={sessionId}
        total={total}
        voted={voted}
        onBulkApprove={handleBulkApprove}
        bulkPending={bulkApprove.isPending}
      />

      {/* Bulk approve confirmation */}
      {confirmBulk && (
        <div className="mx-6 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-center justify-between">
          <span>
            Approve all {images.filter((i) => !i.my_vote).length} unvoted
            images?
          </span>
          <button
            onClick={handleBulkApprove}
            className="px-3 py-1 bg-amber-500 text-white font-semibold rounded-lg text-xs hover:bg-amber-400 transition-colors"
          >
            Confirm
          </button>
        </div>
      )}

      {/* Image grid */}
      <div className="p-6">
        <ImageGrid images={images} onCardClick={handleCardClick} />
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expandedIndex !== null && (
          <ExpandedCard
            images={images}
            selectedIndex={expandedIndex}
            onVote={handleVote}
            onUndo={handleUndo}
            onClose={handleCloseExpanded}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      <KeyboardHelp />
    </LayoutGroup>
  );
}
