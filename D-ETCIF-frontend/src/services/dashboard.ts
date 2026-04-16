// Package services
// D-ETCIF-frontend/src/services/dashboard.ts
import { request } from "./requests";
import { API } from "./api";
import type { HeatmapItem, BehaviorData, WarningData } from "@/types/dashboard";

// 统一在 service 层解包，页面直接拿业务数据。
export const getHeatmapData = async (): Promise<HeatmapItem[]> => {
  const res = await request.get<HeatmapItem[]>(
    API.teacher.dashboard.heatmap,
  );
  return Array.isArray(res) ? res : [];
};

export const getBehaviorData = async (): Promise<BehaviorData> => {
  const res = await request.get<BehaviorData>(
    API.teacher.dashboard.behavior,
  );
  return res || { dimensions: [], values: [] };
};

export const getWarningData = async (): Promise<WarningData> => {
  const res = await request.get<WarningData>(
    API.teacher.dashboard.warning,
  );
  return res || {
    lowConfidence: [],
    highFrequencyError: [],
  };
};
