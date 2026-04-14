// Package types
// D-ETCIF-frontend/src/types/dashboard.ts

export interface HeatmapItem {
  id: string;
  name: string;
  value: number; // 掌握度百分比
  group: string; // 章节名称
}

export interface BehaviorData {
  dimensions: string[];
  values: number[];
}

export interface LowConfidenceStudent {
  name: string;
  subject: string;
  score: number;
}

export interface HighFreqError {
  title: string;
  rate: number;
}

export interface WarningData {
  lowConfidence: LowConfidenceStudent[];
  highFrequencyError: HighFreqError[];
}
