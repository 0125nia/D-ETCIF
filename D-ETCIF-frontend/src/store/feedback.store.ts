import { create } from "zustand";

// 类型定义
interface FeedbackItem {
  id: number;
  name: string;
  feedbacks?: { id: number; name: string }[];
}

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
  experimentList: [
    {
      id: 1,
      name: "实验1",
      feedbacks: [
        { id: 101, name: "反馈1" },
        { id: 102, name: "反馈2" },
      ],
    },
    {
      id: 2,
      name: "实验2",
      feedbacks: [
        { id: 201, name: "反馈A" },
        { id: 202, name: "反馈B" },
      ],
    },
    { id: 3, name: "实验3" },
  ],

  // 当前选中的反馈内容
  selectedFeedback: "请从左侧选择具体反馈查看详情",

  // 更新列表
  setExperimentList: (data) => set({ experimentList: data }),

  // 更新选中反馈
  setSelectedFeedback: (text) => set({ selectedFeedback: text }),
}));
