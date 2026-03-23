import { create } from "zustand";

interface UIState {
  helpOpen: boolean;
  loading: boolean;
  error: string | null;

  openHelp: () => void;
  closeHelp: () => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  helpOpen: false,
  loading: false,
  error: null,

  openHelp: () => set({ helpOpen: true }),
  closeHelp: () => set({ helpOpen: false }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
