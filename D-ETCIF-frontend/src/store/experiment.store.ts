import { create } from "zustand";
import type { Stage, ActiveNav } from "@/types/domain/global";

interface ExperimentState {
  currentExperimentId: number | null;
  currentStage: Stage | null;
  activeNav: ActiveNav;

  enterExperiment: (id: number) => void;
  startDoing: () => void;
  finishExperiment: () => void;
  setNav: (nav: ActiveNav) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  currentExperimentId: null,
  currentStage: null,
  activeNav: "experiment",

  enterExperiment: (id) =>
    set({
      currentExperimentId: id,
      currentStage: "PRE",
      activeNav: "experiment",
    }),

  startDoing: () =>
    set((s) => (s.currentStage === "PRE" ? { currentStage: "DOING" } : {})),

  finishExperiment: () =>
    set((s) => (s.currentStage === "DOING" ? { currentStage: "POST" } : {})),

  setNav: (nav) => set({ activeNav: nav }),
}));
