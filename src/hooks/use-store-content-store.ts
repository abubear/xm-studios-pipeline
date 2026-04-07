"use client";

import { create } from "zustand";

// ── Content tab types ──
export type ContentTab =
  | "turntable"
  | "hero-shots"
  | "closeups"
  | "animation"
  | "poster"
  | "package";

export const CONTENT_TABS: { key: ContentTab; label: string }[] = [
  { key: "turntable", label: "360° Turntable" },
  { key: "hero-shots", label: "Hero Shots" },
  { key: "closeups", label: "Detail Closeups" },
  { key: "animation", label: "Animated Scene" },
  { key: "poster", label: "Pre-Order Poster" },
  { key: "package", label: "Full Package" },
];

// ── Turntable settings ──
export interface TurntableSettings {
  frameCount: number; // 12-36
  cameraElevation: number; // -15 to 45
  outputFormat: "mp4" | "gif" | "webm";
  background: "transparent" | "white" | "studio";
}

// ── Hero shots settings ──
export type LightingPreset = "studio" | "dramatic" | "natural";
export type RenderResolution = 1024 | 2048 | 4096;

export const CAMERA_ANGLES = [
  "Front",
  "Front-quarter",
  "Side",
  "Back-quarter",
  "Back",
  "Top-down",
  "Low angle",
  "Face detail",
] as const;

export type CameraAngle = (typeof CAMERA_ANGLES)[number];

export interface HeroShotsSettings {
  lighting: LightingPreset;
  resolution: RenderResolution;
}

// ── Closeup regions ──
export const CLOSEUP_REGIONS = [
  "face",
  "hands",
  "base",
  "accessories",
  "back detail",
] as const;

export type CloseupRegion = (typeof CLOSEUP_REGIONS)[number];

// ── Animation settings ──
export type AnimationStyle = "subtle" | "moderate" | "cinematic";
export type AnimationDuration = 2 | 3 | 5;

export interface AnimationSettings {
  sceneDescription: string;
  style: AnimationStyle;
  duration: AnimationDuration;
}

// ── Poster settings ──
export type PosterBackground = "dark-gradient" | "themed-scene" | "clean-white";

export interface PosterSettings {
  background: PosterBackground;
  tagline: string;
  features: string[];
}

// ── Generated content item ──
export interface GeneratedContent {
  id: string;
  url: string;
  thumbnailUrl?: string;
  label: string;
  status: "pending" | "generating" | "complete" | "error";
  error?: string;
  metadata?: Record<string, unknown>;
}

// ── Batch progress ──
export interface BatchStep {
  tab: ContentTab;
  status: "pending" | "running" | "complete" | "error";
  progress: number; // 0-100
}

// ── Store state ──
interface StoreContentState {
  // Session context
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Active tab
  activeTab: ContentTab;
  setActiveTab: (tab: ContentTab) => void;

  // Tab completion
  completedTabs: Set<ContentTab>;
  markTabComplete: (tab: ContentTab) => void;
  resetCompletedTabs: () => void;

  // Turntable
  turntableSettings: TurntableSettings;
  setTurntableSettings: (s: Partial<TurntableSettings>) => void;
  turntableResult: GeneratedContent | null;
  setTurntableResult: (r: GeneratedContent | null) => void;

  // Hero shots
  heroShotsSettings: HeroShotsSettings;
  setHeroShotsSettings: (s: Partial<HeroShotsSettings>) => void;
  heroShots: Map<CameraAngle, GeneratedContent>;
  setHeroShot: (angle: CameraAngle, content: GeneratedContent) => void;
  clearHeroShots: () => void;

  // Closeups
  closeups: Map<CloseupRegion, GeneratedContent>;
  setCloseup: (region: CloseupRegion, content: GeneratedContent) => void;
  clearCloseups: () => void;

  // Animation
  animationSettings: AnimationSettings;
  setAnimationSettings: (s: Partial<AnimationSettings>) => void;
  animationResult: GeneratedContent | null;
  setAnimationResult: (r: GeneratedContent | null) => void;

  // Poster
  posterSettings: PosterSettings;
  setPosterSettings: (s: Partial<PosterSettings>) => void;
  posterResult: GeneratedContent | null;
  setPosterResult: (r: GeneratedContent | null) => void;

  // Batch mode
  isBatchRunning: boolean;
  setIsBatchRunning: (v: boolean) => void;
  batchSteps: BatchStep[];
  setBatchSteps: (steps: BatchStep[]) => void;
  updateBatchStep: (tab: ContentTab, update: Partial<BatchStep>) => void;

  // Multi-character
  selectedCharacterIds: string[];
  setSelectedCharacterIds: (ids: string[]) => void;
  currentBatchCharacterIndex: number;
  setCurrentBatchCharacterIndex: (i: number) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generatingTab: ContentTab | null;
  setGeneratingTab: (tab: ContentTab | null) => void;

  // Reset
  reset: () => void;
}

const DEFAULT_TURNTABLE: TurntableSettings = {
  frameCount: 24,
  cameraElevation: 15,
  outputFormat: "mp4",
  background: "studio",
};

const DEFAULT_HERO_SHOTS: HeroShotsSettings = {
  lighting: "studio",
  resolution: 2048,
};

const DEFAULT_ANIMATION: AnimationSettings = {
  sceneDescription: "",
  style: "moderate",
  duration: 3,
};

const DEFAULT_POSTER: PosterSettings = {
  background: "dark-gradient",
  tagline: "",
  features: [],
};

export const useStoreContentStore = create<StoreContentState>((set, get) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  activeTab: "turntable",
  setActiveTab: (tab) => set({ activeTab: tab }),

  completedTabs: new Set(),
  markTabComplete: (tab) => {
    const next = new Set(get().completedTabs);
    next.add(tab);
    set({ completedTabs: next });
  },
  resetCompletedTabs: () => set({ completedTabs: new Set() }),

  turntableSettings: DEFAULT_TURNTABLE,
  setTurntableSettings: (s) =>
    set({ turntableSettings: { ...get().turntableSettings, ...s } }),
  turntableResult: null,
  setTurntableResult: (r) => set({ turntableResult: r }),

  heroShotsSettings: DEFAULT_HERO_SHOTS,
  setHeroShotsSettings: (s) =>
    set({ heroShotsSettings: { ...get().heroShotsSettings, ...s } }),
  heroShots: new Map(),
  setHeroShot: (angle, content) => {
    const next = new Map(get().heroShots);
    next.set(angle, content);
    set({ heroShots: next });
  },
  clearHeroShots: () => set({ heroShots: new Map() }),

  closeups: new Map(),
  setCloseup: (region, content) => {
    const next = new Map(get().closeups);
    next.set(region, content);
    set({ closeups: next });
  },
  clearCloseups: () => set({ closeups: new Map() }),

  animationSettings: DEFAULT_ANIMATION,
  setAnimationSettings: (s) =>
    set({ animationSettings: { ...get().animationSettings, ...s } }),
  animationResult: null,
  setAnimationResult: (r) => set({ animationResult: r }),

  posterSettings: DEFAULT_POSTER,
  setPosterSettings: (s) =>
    set({ posterSettings: { ...get().posterSettings, ...s } }),
  posterResult: null,
  setPosterResult: (r) => set({ posterResult: r }),

  isBatchRunning: false,
  setIsBatchRunning: (v) => set({ isBatchRunning: v }),
  batchSteps: [],
  setBatchSteps: (steps) => set({ batchSteps: steps }),
  updateBatchStep: (tab, update) => {
    const steps = get().batchSteps.map((s) =>
      s.tab === tab ? { ...s, ...update } : s
    );
    set({ batchSteps: steps });
  },

  selectedCharacterIds: [],
  setSelectedCharacterIds: (ids) => set({ selectedCharacterIds: ids }),
  currentBatchCharacterIndex: 0,
  setCurrentBatchCharacterIndex: (i) => set({ currentBatchCharacterIndex: i }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  generatingTab: null,
  setGeneratingTab: (tab) => set({ generatingTab: tab }),

  reset: () =>
    set({
      activeTab: "turntable",
      completedTabs: new Set(),
      turntableSettings: DEFAULT_TURNTABLE,
      turntableResult: null,
      heroShotsSettings: DEFAULT_HERO_SHOTS,
      heroShots: new Map(),
      closeups: new Map(),
      animationSettings: DEFAULT_ANIMATION,
      animationResult: null,
      posterSettings: DEFAULT_POSTER,
      posterResult: null,
      isBatchRunning: false,
      batchSteps: [],
      isGenerating: false,
      generatingTab: null,
    }),
}));
