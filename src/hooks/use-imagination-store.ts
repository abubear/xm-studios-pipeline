"use client";

import { create } from "zustand";

export type ImageCount = 4 | 6 | 9;

export interface GeneratedImage {
  id: string;
  url: string;
  seed: number;
  prompt: string;
  status: "generated" | "approved" | "rejected";
}

export interface GenerationResult {
  prompt: string;
  images: GeneratedImage[];
  timestamp: number;
}

interface ImaginationState {
  // Inputs
  description: string;
  setDescription: (d: string) => void;
  referenceUrl: string | null;
  setReferenceUrl: (url: string | null) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  imageCount: ImageCount;
  setImageCount: (c: ImageCount) => void;

  // Generation
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  currentPrompt: string | null;
  setCurrentPrompt: (p: string | null) => void;
  promptExpanded: boolean;
  togglePromptExpanded: () => void;

  // Results
  currentResults: GeneratedImage[];
  setCurrentResults: (images: GeneratedImage[]) => void;
  updateImageStatus: (id: string, status: GeneratedImage["status"]) => void;
  approvedImages: GeneratedImage[];

  // History
  history: GenerationResult[];
  addToHistory: (result: GenerationResult) => void;

  // Reset
  reset: () => void;
}

export const STYLE_TAGS = [
  "dramatic pose",
  "dark mood",
  "polystone",
  "dynamic action",
  "museum display",
  "cinematic lighting",
  "battle damaged",
  "heroic stance",
  "detailed base",
  "weathered texture",
  "metallic finish",
  "translucent effects",
];

export const useImaginationStore = create<ImaginationState>((set, get) => ({
  description: "",
  setDescription: (d) => set({ description: d }),
  referenceUrl: null,
  setReferenceUrl: (url) => set({ referenceUrl: url }),
  selectedTags: [],
  toggleTag: (tag) => {
    const { selectedTags } = get();
    set({
      selectedTags: selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    });
  },
  imageCount: 4,
  setImageCount: (c) => set({ imageCount: c }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  currentPrompt: null,
  setCurrentPrompt: (p) => set({ currentPrompt: p }),
  promptExpanded: false,
  togglePromptExpanded: () =>
    set((s) => ({ promptExpanded: !s.promptExpanded })),

  currentResults: [],
  setCurrentResults: (images) => set({ currentResults: images }),
  updateImageStatus: (id, status) => {
    const { currentResults } = get();
    set({
      currentResults: currentResults.map((img) =>
        img.id === id ? { ...img, status } : img
      ),
    });
  },
  get approvedImages() {
    return get().currentResults.filter((img) => img.status === "approved");
  },

  history: [],
  addToHistory: (result) => {
    const { history } = get();
    set({ history: [result, ...history].slice(0, 20) });
  },

  reset: () =>
    set({
      description: "",
      referenceUrl: null,
      selectedTags: [],
      currentPrompt: null,
      currentResults: [],
      isGenerating: false,
    }),
}));
