import { create } from "zustand";
import { trackMidEvent } from "@/services/tracker";
import { useExperimentStore } from "./experiment.store";

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
  setHelpModalOpen: (open: boolean) => {
    set({ helpModalOpen: open });
    if (open) {
      // 触发求助埋点
      const expId = useExperimentStore.getState().currentExperimentId;
      trackMidEvent({
        experiment_id: expId ? expId.toString() : "unknown",
        action_type: "help_trigger",
        content: "用户打开了求助弹窗",
        duration: 0,
      }).catch(console.error);
    }
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useUIStore;
