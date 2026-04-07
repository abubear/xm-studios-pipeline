"use client";

import { create } from "zustand";

export type ModelFormat = "GLB" | "FBX" | "OBJ" | "USD" | "STL";
export type CharacterTag =
  | "armoured"
  | "caped"
  | "masked"
  | "melee"
  | "magic"
  | "hero"
  | "villain";

export const FORMAT_OPTIONS: ModelFormat[] = ["GLB", "FBX", "OBJ", "USD", "STL"];
export const TAG_OPTIONS: CharacterTag[] = [
  "armoured",
  "caped",
  "masked",
  "melee",
  "magic",
  "hero",
  "villain",
];

interface LibraryState {
  // Search & Filters
  search: string;
  setSearch: (s: string) => void;
  ipFilter: string | null;
  setIpFilter: (id: string | null) => void;
  formatFilter: ModelFormat | null;
  setFormatFilter: (f: ModelFormat | null) => void;
  selectedTags: CharacterTag[];
  toggleTag: (tag: CharacterTag) => void;
  polyRange: [number, number];
  setPolyRange: (range: [number, number]) => void;
  minVoteScore: number;
  setMinVoteScore: (v: number) => void;

  // Detail panel
  selectedEntryId: string | null;
  setSelectedEntryId: (id: string | null) => void;
  detailTab: "info" | "formats" | "history" | "similar";
  setDetailTab: (tab: "info" | "formats" | "history" | "similar") => void;

  // Reset
  resetFilters: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  search: "",
  setSearch: (s) => set({ search: s }),
  ipFilter: null,
  setIpFilter: (id) => set({ ipFilter: id }),
  formatFilter: null,
  setFormatFilter: (f) => {
    const current = get().formatFilter;
    set({ formatFilter: current === f ? null : f });
  },
  selectedTags: [],
  toggleTag: (tag) => {
    const { selectedTags } = get();
    set({
      selectedTags: selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    });
  },
  polyRange: [0, 10000000],
  setPolyRange: (range) => set({ polyRange: range }),
  minVoteScore: 0,
  setMinVoteScore: (v) => set({ minVoteScore: v }),

  selectedEntryId: null,
  setSelectedEntryId: (id) => set({ selectedEntryId: id }),
  detailTab: "info",
  setDetailTab: (tab) => set({ detailTab: tab }),

  resetFilters: () =>
    set({
      search: "",
      ipFilter: null,
      formatFilter: null,
      selectedTags: [],
      polyRange: [0, 10000000],
      minVoteScore: 0,
    }),
}));
