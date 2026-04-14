// Package store
// D-ETCIF-frontend/src/store/ui.store.ts
import { create } from "zustand";

interface UIState {
  loading: boolean;
  error: string | null;
  helpModalOpen: boolean;

  setHelpModalOpen: (open: boolean) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
}

// 约束：UI store 只放 UI 状态，不做埋点/不跨 store 读取（Phase 3）
export const useUIStore = create<UIState>((set) => ({
  loading: false,
  error: null,
  helpModalOpen: false,

  setHelpModalOpen: (open: boolean) => set({ helpModalOpen: open }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useUIStore;
