import { create } from "zustand";
import type { Stage, UserRole, ActiveNav } from "@/types/domain/global";
import axios from "axios";
import { toast } from "./useToastStore";

interface GlobalState {
  // 学生专属
  currentStage: Stage | null;
  currentExperimentId: number | null;

  // 全局
  activeNav: ActiveNav;
  userInfo: { id: string; name: string; role: UserRole };
  loading: boolean;
  error: string | null;
  // 打开求助弹窗
  helpModalOpen: boolean;

  // 方法
  setHelpModalOpen: (open: boolean) => void;
  setCurrentStage: (stage: Stage) => void;
  setCurrentExperimentId: (id: number) => void;
  setActiveNav: (nav: ActiveNav) => void;
  fetchSystemData: () => Promise<void>;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  helpModalOpen: false,

  currentStage: "PRE",
  currentExperimentId: null,
  activeNav: "experiment",

  userInfo: { id: "", name: "", role: "student" },
  loading: false,
  error: null,

  setHelpModalOpen: (open: boolean) => set({ helpModalOpen: open }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setCurrentExperimentId: (id) => set({ currentExperimentId: id }),
  setActiveNav: (activeNav) => set({ activeNav }),

  fetchSystemData: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get("/api/system/init");
      set({
        userInfo: data.userInfo,
        currentStage:
          data.userInfo.role === "student" ? data.currentStage : null,
        currentExperimentId: data.currentExperimentId,
        activeNav: data.activeNav,
        loading: false,
      });
    } catch (err) {
      toast.error("系统初始化失败，请刷新重试");
      set({ loading: false, error: "初始化失败" });
    }
  },
}));
