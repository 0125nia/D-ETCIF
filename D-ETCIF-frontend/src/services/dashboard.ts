// Package services
// D-ETCIF-frontend/src/services/dashboard.ts
import { request } from "./requests";
import { API } from "./api";
import type { HeatmapItem, BehaviorData, WarningData } from "@/types/dashboard";

// 包装一层 data，因为后端返回格式是 { data: ... }
export const getHeatmapData = () =>
  request.get<{ data: HeatmapItem[] }>(API.teacher.dashboard.heatmap);

export const getBehaviorData = () =>
  request.get<{ data: BehaviorData }>(API.teacher.dashboard.behavior);

export const getWarningData = () =>
  request.get<{ data: WarningData }>(API.teacher.dashboard.warning);
