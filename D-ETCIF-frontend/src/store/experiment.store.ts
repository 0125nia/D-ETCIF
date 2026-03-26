import { create } from "zustand";
import type { Stage } from "@/types/domain/global";
import { trackPreEvent, trackMidEvent, trackPostEvent } from "@/services/tracker";

interface ExperimentState {
  currentExperimentId: number | null;
  currentStage: Stage | null;

  enterExperiment: (id: number) => void;
  startDoing: () => void;
  finishExperiment: () => void;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  currentExperimentId: 1,
  currentStage: "PRE",

  enterExperiment: (id) => {
    set({
      currentExperimentId: id,
      currentStage: "PRE",
    });
    // 预习埋点：进入实验
    trackPreEvent({
      experiment_id: id.toString(),
      resource_id: "experiment_entry",
      resource_name: "进入实验",
      path: window.location.pathname,
      duration: 0,
    }).catch(console.error);
  },

  startDoing: () => {
    const { currentStage, currentExperimentId } = get();
    if (currentStage === "PRE") {
      set({ currentStage: "DOING" });
      // 实验中埋点：开始实验
      if (currentExperimentId) {
        trackMidEvent({
          experiment_id: currentExperimentId.toString(),
          action_type: "start_experiment",
          content: "从预习阶段进入实验阶段",
          duration: 0,
        }).catch(console.error);
      }
    }
  },

  finishExperiment: () => {
    const { currentStage, currentExperimentId } = get();
    if (currentStage === "DOING") {
      set({ currentStage: "POST" });
      // 实验后埋点：完成实验
      if (currentExperimentId) {
        trackPostEvent({
          experiment_id: currentExperimentId.toString(),
          action_type: "finish_experiment",
          score: 0,
          content: "从实验阶段进入总结阶段",
        }).catch(console.error);
      }
    }
  },
}));
