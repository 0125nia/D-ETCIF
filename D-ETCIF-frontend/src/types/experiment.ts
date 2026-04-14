// Package types
// D-ETCIF-frontend/src/types/experiment.ts
export type Stage = "PRE" | "DOING" | "POST";

export interface ExperimentItem {
  id: number;
  experiment_id: number;
  name: string;
  desc: string;
  difficulty: number;
}

// 学生实验阶段（后端返回）
export interface UserExperimentStage {
  experiment_id: number;
  current_stage: Stage; // PRE / DOING / POST
}

export interface ExperimentWithStage extends ExperimentItem {
  stage: Stage;
}
