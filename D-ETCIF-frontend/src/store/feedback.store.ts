import { create } from "zustand";
import type { FeedbackItem } from "@/types/domain/feedback";


interface FeedbackStore {
  // 实验列表数据
  experimentList: FeedbackItem[];
  // 当前选中的反馈
  selectedFeedback: string;
  // Action
  setExperimentList: (data: FeedbackItem[]) => void;
  setSelectedFeedback: (text: string) => void;
}

// 创建 store
export const useFeedbackStore = create<FeedbackStore>((set) => ({
  // 初始数据
  experimentList: [],

  // 当前选中的反馈内容
  selectedFeedback: "请从左侧选择具体反馈查看详情",

  // 更新列表
  setExperimentList: (data) => set({ experimentList: data }),

  // 更新选中反馈
  setSelectedFeedback: (text) => set({ selectedFeedback: text }),
}));
