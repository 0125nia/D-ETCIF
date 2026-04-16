// Package store
// D-ETCIF-frontend/src/store/feedback.store.ts
import { create } from "zustand";
import type { FeedbackItem, Feedback } from "@/types/feedback";

interface FeedbackStore {
  experimentList: FeedbackItem[];
  selectedFeedback: Feedback | null;
  feedbackList: Feedback[];

  setExperimentList: (data: FeedbackItem[]) => void;
  setSelectedFeedback: (feedback: Feedback | null) => void;
  setFeedbackList: (list: Feedback[]) => void;
  appendFeedback: (feedback: Feedback) => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  experimentList: [],
  selectedFeedback: null,
  feedbackList: [],

  setExperimentList: (data) => set({ experimentList: data }),
  setSelectedFeedback: (feedback) => set({ selectedFeedback: feedback }),
  setFeedbackList: (list) => set({ feedbackList: list }),
  appendFeedback: (feedback) =>
    set((state) => ({ feedbackList: [feedback, ...state.feedbackList] })),
}));
