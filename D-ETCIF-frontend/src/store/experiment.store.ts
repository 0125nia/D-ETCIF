import { create } from "zustand";
import type { Stage } from "@/types/domain/global";

interface ExperimentState {
  currentExperimentId: number | null;
  currentStage: Stage | null;

  enterExperiment: (id: number) => void;
  startDoing: () => void;
  finishExperiment: () => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  currentExperimentId: 1,
  currentStage: "PRE",

  enterExperiment: (id) =>
    set({
      currentExperimentId: id,
      currentStage: "PRE",
    }),

  startDoing: () =>
    set((s) => (s.currentStage === "PRE" ? { currentStage: "DOING" } : {})),

  finishExperiment: () =>
    set((s) => (s.currentStage === "DOING" ? { currentStage: "POST" } : {})),
}));
