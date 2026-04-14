// Package store
// D-ETCIF-frontend/src/store/feedback.store.ts
import { create } from "zustand";
import type { FeedbackItem, Feedback } from "@/types/feedback";

const MOCK_FEEDBACKS: Feedback[] = [
  // {
  //   id: "fb_001",
  //   type: "即时提醒",
  //   title: "逻辑校验：数据关联异常",
  //   content: `【逻辑冲突】检测到你对 'df_sales' 进行了排序处理，但在绘图时 X 轴仍引用原始顺序的 'sign' 变量。
  //   这违反了知识图谱中的“数据一致性”约束，会导致图表信息错位。
  //   建议：使用排序后的索引 df_sales_sorted.index 作为 X 轴，以确保数据与标签正确对应。`,
  //   severity: "error", // 严格遵守：逻辑错误导致结论失效，设为 error
  //   createdAt: Date.now(),
  // },
  // {
  //   id: "2",
  //   type: "思路引导",
  //   title: "图表中文显示配置超时",
  //   content: `看起来你在设置图表中文显示时遇到了困难。
  // 核心知识点：plt.rcParams 配置。
  // 提示：确保字体名称 'SimHei' 拼写正确，且 axes.unicode_minus 设置为 False。
  // 参考路径：如果在本地环境运行，请确认系统已安装黑体字体。`,
  //   severity: "warning",
  //   createdAt: Date.now(),
  // },
  // {
  //   id: "fb_004",
  //   type: "即时提醒",
  //   title: "知识点掌握度同步",
  //   content: `【认知图谱更新】根据你在本次实验中对 Excel 多工作表读取（sheet_name）的精准操作，系统已调高你个人认知图谱中“数据源管理”知识点的掌握度。
  //   继续保持这种规范的参数调用习惯！`,
  //   severity: "success",
  //   createdAt: Date.now(),
  // },
];

const MOCK_EXPERIMENT: FeedbackItem = {
  id: 1,
  name: "数据分析实验",
  feedbacks: MOCK_FEEDBACKS,
};

interface FeedbackStore {
  experimentList: FeedbackItem[];
  selectedFeedback: Feedback | null;
  feedbackList: Feedback[];

  setExperimentList: (data: FeedbackItem[]) => void;
  setSelectedFeedback: (feedback: Feedback | null) => void;
  setFeedbackList: (list: Feedback[]) => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  experimentList: [MOCK_EXPERIMENT],
  selectedFeedback: null,
  feedbackList: MOCK_FEEDBACKS, // ✅ 注入 mock 数据

  setExperimentList: (data) => set({ experimentList: data }),
  setSelectedFeedback: (feedback) => set({ selectedFeedback: feedback }),
  setFeedbackList: (list) => set({ feedbackList: list }),
}));
