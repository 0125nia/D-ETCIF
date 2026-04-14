// Package store
// D-ETCIF-frontend/src/store/experiment.store.ts
import { create } from "zustand";
import type { Stage } from "@/types/experiment";
import { checkDoingStageDone } from "@/services/experiment";

interface ExperimentState {
  currentExperimentId: number | null;
  currentStage: Stage | null;

  enterExperiment: (id: number) => void;
  startDoing: () => void;
  finishExperiment: () => void;
  checkCanMoveToPost: () => Promise<boolean>;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  currentExperimentId: 1,
  currentStage: null,

  enterExperiment: (id) => {
    set({
      currentExperimentId: id,
      currentStage: "DOING",
    });
  },

  startDoing: () => {
    const { currentStage } = get();
    if (currentStage === "PRE") {
      set({ currentStage: "DOING" });
    }
  },

  finishExperiment: () => {
    const { currentStage } = get();
    if (currentStage === "DOING") {
      set({ currentStage: "POST" });
    }
  },

  setStage: (stage: Stage) => set({ currentStage: stage }),

  checkCanMoveToPost: async () => {
    const { currentExperimentId } = get();
    if (!currentExperimentId) return false;
    try {
      // 调用后端“伴随式评价”接口，获取当前实验是否达标
      const { data } = await checkDoingStageDone(currentExperimentId);

      if (!data.can_move) {
        // 如果后端说不行，可以在这里做点什么，或者把 message 返回出去
        console.warn("未达标原因:", data.message);
      }
      return data.can_move;
    } catch (error) {
      console.error("检查状态失败", error);
      return false; // 报错则默认拦截，保证逻辑严谨
    }
  },
}));
