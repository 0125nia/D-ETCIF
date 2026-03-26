import { create } from "zustand";
import { getHeatmapData, getWarningData, getBehaviorData, type HeatmapData, type WarningData, type BehaviorData } from "@/services/dashboard";

interface DashboardState {
  heatmap: HeatmapData[];
  warning: WarningData | null;
  behavior: BehaviorData | null;
  loading: boolean;

  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  heatmap: [],
  warning: null,
  behavior: null,
  loading: false,

  fetchDashboardData: async () => {
    set({ loading: true });
    try {
      const [heatmapRes, warningRes, behaviorRes] = await Promise.all([
        getHeatmapData(),
        getWarningData(),
        getBehaviorData()
      ]);
      set({ 
        heatmap: heatmapRes.data, 
        warning: warningRes.data,
        behavior: behaviorRes.data,
        loading: false 
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      set({ loading: false });
    }
  }
}));
