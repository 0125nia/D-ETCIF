// Package types
// D-ETCIF-frontend/src/types/profile.ts
export interface CognitiveMapData {
  nodes: { id: string; name: string; expid: number; type: string }[];
  links: { source: string; target: string; value: number }[];
}

export interface ResourceRecommendation {
  id: number;
  name: string;
  link?: string; // 可选的资源链接
}

export interface StudyReportData {
  total_time: number;
  total_exp: number;
  error_rate: number;
  average_score: number;
}
