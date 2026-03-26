import { create } from "zustand";
import { getCognitiveMap, getStudyReport } from "@/services/profile";
import type {
  CognitiveMapData,
  StudyReportData,
  ResourceRecommendation,
} from "@/types/domain/profile";

interface ProfileState {
  cognitiveMap: CognitiveMapData | null;
  studyReport: StudyReportData | null;
  resourceRecommendations: ResourceRecommendation[];
  loading: boolean;
  error: string | null;

  fetchProfileData: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  cognitiveMap: {
    nodes: [],
    links: [],
  },
  studyReport: {
    total_time: 40,
    total_exp: 2,
    error_rate: 5,
    average_score: 80,
  },
  resourceRecommendations: [],
  loading: false,
  error: null,

  fetchProfileData: async () => {
    set({ loading: true, error: null });
    try {
      const [mapRes, reportRes] = await Promise.all([
        getCognitiveMap(),
        getStudyReport(),
      ]);
      set({
        cognitiveMap: mapRes.data,
        studyReport: reportRes.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      // set({ loading: false, error: "获取数据失败，请稍后重试" });
      set({
        cognitiveMap: {
          nodes: [
            { id: "stu_001", name: "Demo学生", expid: 1, type: "Student" },
            {
              id: "kp_read",
              name: "数据读取",
              expid: 2,
              type: "KnowledgePoint",
            },
            {
              id: "kp_transform",
              name: "数据变换",
              expid: 3,
              type: "KnowledgePoint",
            },
            {
              id: "kp_distribution",
              name: "分布理解",
              expid: 4,
              type: "KnowledgePoint",
            },
            {
              id: "kp_visual",
              name: "可视化实现",
              expid: 5,
              type: "KnowledgePoint",
            },
            {
              id: "kp_tool",
              name: "工具认知",
              expid: 6,
              type: "KnowledgePoint",
            },
          ],

          links: [
            { source: "stu_001", target: "kp_read", value: 0.3 },
            { source: "stu_001", target: "kp_transform", value: 0.3 },
            { source: "stu_001", target: "kp_distribution", value: 0.3 },
            { source: "stu_001", target: "kp_visual", value: 0.3 },
            { source: "stu_001", target: "kp_tool", value: 0.3 },
          ],
        },
        studyReport: {
          total_time: 40,
          total_exp: 2,
          error_rate: 5,
          average_score: 80,
        },
        resourceRecommendations: [
          {
            id: 1,
            name: "Python 常见数据可视化库",
            link: "/knowledge/python-visualization-libraries",
          },
          {
            id: 2,
            name: "matplotlib 的三种 API",
            link: "/knowledge/matplotlib-apis",
          },
          {
            id: 3,
            name: "常见数据可视化方式",
            link: "/knowledge/common-visualization-ways",
          },
          {
            id: 4,
            name: "数据可视化的定义",
            link: "/knowledge/data-visualization",
          },
        ],
        loading: false,
        error: null,
      });
    }
  },
}));
