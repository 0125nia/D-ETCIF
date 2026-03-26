import { request } from "./requests";

export interface HeatmapData {
  name: string;
  value: number;
}

export interface WarningData {
  low_confidence: { name: string; score: number }[];
  high_frequency_error: { error: string; count: number }[];
}

export interface BehaviorData {
  indicators: { name: string; max: number }[];
  data: { value: number[]; name: string }[];
}

export const getHeatmapData = () => {
  return request.get<{ data: HeatmapData[] }>("/api/teacher/dashboard/heatmap");
};

export const getWarningData = () => {
  return request.get<{ data: WarningData }>("/api/teacher/dashboard/warning");
};

export const getBehaviorData = () => {
  return request.get<{ data: BehaviorData }>("/api/teacher/dashboard/behavior");
};
