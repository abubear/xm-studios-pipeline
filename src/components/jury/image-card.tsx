"use client";

import { memo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { JuryImage } from "@/types/jury";

interface ImageCardProps {
  image: JuryImage;
  index: number;
  onClick: (index: number) => void;
}

export const ImageCard = memo(function ImageCard({
  image,
  index,
  onClick,
}: ImageCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Lazy loading
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 300) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const score = image.approve_count - image.reject_count;
  const rawAesthetic = (
    image.metadata as Record<string, unknown> | undefined
  )?.aesthetic_score;
  const aestheticScore = typeof rawAesthetic === "number" ? rawAesthetic : null;

  return (
    <motion.div
      ref={ref}
      layoutId={`card-${image.id}`}
      onClick={() => onClick(index)}
      className="relative bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.03] group"
    >
      {/* Vote status pill badge */}
      {image.my_vote && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
              image.my_vote === "approve"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {image.my_vote === "approve" ? "Approved" : "Rejected"}
          </span>
        </div>
      )}

      {/* Image — fixed height, object-cover */}
      <div className="h-56 bg-zinc-100 overflow-hidden">
        {visible ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image.thumbnail_url || image.url}
            alt={`Concept #${image.id.slice(0, 6)}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-zinc-100" />
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        <p className="text-[15px] font-semibold text-zinc-900">
          Concept #{image.id.slice(0, 6)}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {image.seed !== null ? `Seed: ${image.seed}` : "No seed"}
          {image.workflow && ` · ${image.workflow}`}
        </p>

        {image.prompt && (
          <p className="text-[13px] text-zinc-500 mt-1.5 truncate">
            {image.prompt}
          </p>
        )}

        {/* Stat pills */}
        <div className="flex items-center mt-3 rounded-xl bg-zinc-50 overflow-hidden">
          <div className="flex-1 py-2 px-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Score
            </p>
            <p className="text-lg font-bold text-zinc-900 leading-tight">
              {score > 0 ? "+" : ""}
              {score}
            </p>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div className="flex-1 py-2 px-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Aesthetic
            </p>
            <p className="text-lg font-bold text-zinc-900 leading-tight">
              {aestheticScore?.toFixed(1) ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
