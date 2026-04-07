"use client";

import { create } from "zustand";

export type SortMode = "top_rated" | "most_recent" | "most_iconic";
export type SourceFilter = "all" | "comicvine" | "upload";

export interface SelectedImage {
  id: string;
  url: string;
  caption: string;
  source: string;
  sourceId: string | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
}

interface SceneComposerState {
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // ComicVine results sorting/filtering
  sortMode: SortMode;
  setSortMode: (s: SortMode) => void;
  sourceFilter: SourceFilter;
  setSourceFilter: (f: SourceFilter) => void;

  // Selected images basket (max 8)
  selectedImages: SelectedImage[];
  addImage: (img: SelectedImage) => boolean;
  removeImage: (id: string) => void;
  reorderImages: (from: number, to: number) => void;
  clearImages: () => void;

  // Master reference
  masterReferenceId: string | null;
  setMasterReference: (id: string | null) => void;
}

export const useSceneComposerStore = create<SceneComposerState>((set, get) => ({
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  sortMode: "most_iconic",
  setSortMode: (s) => set({ sortMode: s }),
  sourceFilter: "all",
  setSourceFilter: (f) => set({ sourceFilter: f }),

  selectedImages: [],
  addImage: (img) => {
    const { selectedImages } = get();
    if (selectedImages.length >= 8) return false;
    if (selectedImages.some((i) => i.id === img.id)) return false;
    set({ selectedImages: [...selectedImages, img] });
    // Auto-set first image as master
    if (selectedImages.length === 0) {
      set({ masterReferenceId: img.id });
    }
    return true;
  },
  removeImage: (id) => {
    const { selectedImages, masterReferenceId } = get();
    const filtered = selectedImages.filter((i) => i.id !== id);
    set({ selectedImages: filtered });
    if (masterReferenceId === id) {
      set({ masterReferenceId: filtered[0]?.id ?? null });
    }
  },
  reorderImages: (from, to) => {
    const { selectedImages } = get();
    const updated = [...selectedImages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    set({ selectedImages: updated });
  },
  clearImages: () => set({ selectedImages: [], masterReferenceId: null }),

  masterReferenceId: null,
  setMasterReference: (id) => set({ masterReferenceId: id }),
}));
