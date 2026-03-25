import { create } from "zustand";

interface UIState {
  loading: boolean;
  error: string | null;
  helpModalOpen: boolean;

  setHelpModalOpen: (open: boolean) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  error: null,
  helpModalOpen: false,
  setHelpModalOpen: (open: boolean) => set({ helpModalOpen: open }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useUIStore;
