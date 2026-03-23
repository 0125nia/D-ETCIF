import { create } from "zustand";

interface QuestionsStore {
  // 当前选中的题目 ID
  activeQuestionId: number | null;
  // 设置选中的题目
  setActiveQuestionId: (id: number | null) => void;
}

export const useQuestionsStore = create<QuestionsStore>((set) => ({
  activeQuestionId: null,
  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
}));
