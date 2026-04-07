"use client";

import { cn } from "@/lib/utils";
import { ImageCard } from "./image-card";
import { useJuryStore } from "@/hooks/use-jury-store";
import type { JuryImage } from "@/types/jury";

interface ImageGridProps {
  images: JuryImage[];
  onCardClick: (index: number) => void;
}

export function ImageGrid({ images, onCardClick }: ImageGridProps) {
  const density = useJuryStore((s) => s.density);

  return (
    <div
      className={cn(
        "grid gap-4",
        density === "3" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        density === "4" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        density === "5" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}
    >
      {images.map((image, index) => (
        <ImageCard
          key={image.id}
          image={image}
          index={index}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
