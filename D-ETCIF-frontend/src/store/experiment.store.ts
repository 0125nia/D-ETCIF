// Package store
// D-ETCIF-frontend/src/store/experiment.store.ts
import { create } from "zustand";
import type { Stage } from "@/types/experiment";
import {
  checkDoingStageDone,
  getExperimentStages,
} from "@/services/experiment";
import { STORAGE_KEYS } from "@/constants/storage";
import { useAuthStore } from "./auth.store";

interface ExperimentState {
  currentExperimentId: number | null;
  currentStage: Stage | null;
  loading: boolean;

  enterExperiment: (id: number, stage: Stage) => void;
  startDoing: () => void;
  finishExperiment: () => void;
  checkCanMoveToPost: () => Promise<boolean>;
  resetExperiment: () => void;
  setStage: (stage: Stage) => void;
  initFromStorage: () => void;
  refreshStage: () => Promise<void>;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  currentExperimentId: null,
  currentStage: null,
  loading: false,

  enterExperiment: (id, stage) => {
    set({
      currentExperimentId: id,
      currentStage: stage,
    });
    localStorage.setItem(STORAGE_KEYS.experimentId, id.toString());
    localStorage.setItem(STORAGE_KEYS.experimentStage, stage);
  },

  resetExperiment: () => {
    set({
      currentExperimentId: null,
      currentStage: null,
    });
    localStorage.removeItem(STORAGE_KEYS.experimentId);
    localStorage.removeItem(STORAGE_KEYS.experimentStage);
  },

  startDoing: () => {
    const { currentStage } = get();
    if (currentStage === "PRE") {
      set({ currentStage: "DOING" });
      localStorage.setItem(STORAGE_KEYS.experimentStage, "DOING");
    }
  },

  finishExperiment: () => {
    const { currentStage } = get();
    if (currentStage === "DOING") {
      set({ currentStage: "POST" });
      localStorage.setItem(STORAGE_KEYS.experimentStage, "POST");
    }
  },

  setStage: (stage: Stage) => {
    set({ currentStage: stage });
    localStorage.setItem(STORAGE_KEYS.experimentStage, stage);
  },

  initFromStorage: () => {
    const experimentIdStr = localStorage.getItem(STORAGE_KEYS.experimentId);
    const stage = localStorage.getItem(
      STORAGE_KEYS.experimentStage,
    ) as Stage | null;

    if (experimentIdStr) {
      const experimentId = parseInt(experimentIdStr, 10);
      if (!isNaN(experimentId)) {
        set({
          currentExperimentId: experimentId,
          currentStage: stage,
        });
        // 刷新阶段信息
        get().refreshStage();
      }
    }
  },

  refreshStage: async () => {
    const { currentExperimentId, loading } = get();
    if (!currentExperimentId || loading) return;

    set({ loading: true });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) return;

      const stages = await getExperimentStages();
      const experimentStage = stages.find(
        (s) => s.experiment_id === currentExperimentId,
      );
      if (experimentStage) {
        set({ currentStage: experimentStage.current_stage });
        localStorage.setItem(
          STORAGE_KEYS.experimentStage,
          experimentStage.current_stage,
        );
      }
    } catch (error) {
      console.error("刷新实验阶段失败", error);
    } finally {
      set({ loading: false });
    }
  },

  checkCanMoveToPost: async () => {
    const { currentExperimentId } = get();
    if (!currentExperimentId) return false;
    try {
      // 调用后端“伴随式评价”接口，获取当前实验是否达标
      const { can_move, message } =
        await checkDoingStageDone(currentExperimentId);

      if (!can_move) {
        // 如果后端说不行，可以在这里做点什么，或者把 message 返回出去
        console.warn("未达标原因:", message);
      }
      return can_move;
    } catch (error) {
      console.error("检查状态失败", error);
      return false; // 报错则默认拦截，保证逻辑严谨
    }
  },
}));
