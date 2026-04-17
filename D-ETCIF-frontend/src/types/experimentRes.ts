// Package types
// D-ETCIF-frontend/src/types/experimentRes.ts
// 基础结果模型
export interface ExperimentReport {
  id: number;
  user_id: number;
  experiment_id: number;
  file_name: string;
  file_path: string;
  status: number; // 1: 已上传, 2: 已批阅
  updated_at: number;
}

export interface ExperimentSummary {
  id: number;
  user_id: number;
  experiment_id: number;
  learning_content: string;
  problems_solved: string;
  status: "draft" | "submitted";
}

export interface OperationResult {
  behavior_score: number;
  post_score: number;
}

// 教师端 - 全班概览项
export interface StudentExperimentOverview {
  user_id: number;
  username: string;
  experiment_id: number;
  current_stage: number; // 对应后端 model.StudentExperimentOverview 的 CurrentStage
  operation_score: number;
  summary_status: "draft" | "submitted" | "empty";
  has_report: boolean;
}

// 教师端 - 学生详情聚合结果
export interface StudentResultDetail {
  student_id: number;
  experiment_id: number;
  summary: ExperimentSummary | null;
  report: ExperimentReport | null;
  operation_result: OperationResult | null;
}
