import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JuryFilter, JurySort, GridDensity, ActivityEvent } from "@/types/jury";

interface UndoEntry {
  imageId: string;
  previousVote: "approve" | "reject" | null;
}

interface JuryStore {
  // Grid display
  density: GridDensity;
  filter: JuryFilter;
  sort: JurySort;
  setDensity: (d: GridDensity) => void;
  setFilter: (f: JuryFilter) => void;
  setSort: (s: JurySort) => void;

  // Selection / navigation
  selectedIndex: number;
  setSelectedIndex: (i: number) => void;

  // Panels
  activityOpen: boolean;
  toggleActivity: () => void;
  helpOpen: boolean;
  toggleHelp: () => void;

  // Undo stack
  undoStack: UndoEntry[];
  pushUndo: (entry: UndoEntry) => void;
  popUndo: () => UndoEntry | undefined;

  // Activity feed
  activityFeed: ActivityEvent[];
  addActivity: (event: ActivityEvent) => void;

  // Connection
  connectionStatus: "connected" | "reconnecting" | "disconnected";
  setConnectionStatus: (s: "connected" | "reconnecting" | "disconnected") => void;
}

export const useJuryStore = create<JuryStore>()(
  persist(
    (set, get) => ({
      density: "4",
      filter: "all",
      sort: "id",
      setDensity: (density) => set({ density }),
      setFilter: (filter) => set({ filter, selectedIndex: 0 }),
      setSort: (sort) => set({ sort }),

      selectedIndex: 0,
      setSelectedIndex: (selectedIndex) => set({ selectedIndex }),

      activityOpen: false,
      toggleActivity: () => set({ activityOpen: !get().activityOpen }),
      helpOpen: false,
      toggleHelp: () => set({ helpOpen: !get().helpOpen }),

      undoStack: [],
      pushUndo: (entry) =>
        set({ undoStack: [...get().undoStack, entry].slice(-50) }),
      popUndo: () => {
        const stack = get().undoStack;
        if (stack.length === 0) return undefined;
        const entry = stack[stack.length - 1];
        set({ undoStack: stack.slice(0, -1) });
        return entry;
      },

      activityFeed: [],
      addActivity: (event) =>
        set({ activityFeed: [event, ...get().activityFeed].slice(0, 30) }),

      connectionStatus: "connected",
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
    }),
    {
      name: "xm-jury-prefs",
      partialize: (state) => ({
        density: state.density,
      }),
    }
  )
);
