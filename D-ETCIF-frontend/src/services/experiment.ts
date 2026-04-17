// Package services
// D-ETCIF-frontend/src/services/experiment.ts
import { request } from "@/services/requests";
import { useExperimentStore } from "@/store/experiment.store";
import { API } from "./api";
import type {
  UserExperimentStage,
  ExperimentItem,
  PreExperimentData,
  ExperimentSummary,
  OperationResult,
  DoingTask,
  PostExamRaw,
} from "@/types";
/**
 * 获取实验前资源列表
 */
export async function getPreExperimentResources(): Promise<
  PreExperimentData[]
> {
  const experimentId = useExperimentStore.getState().currentExperimentId;

  if (!experimentId) {
    return Promise.reject(new Error("未选择实验"));
  }

  const response = await request.get<PreExperimentData[]>(API.experiment.pre(experimentId));
  return response || [];
}

/**
 * 获取实验中实验内容
 */
export async function getDoingExperimentContent(): Promise<DoingTask[]> {
  const experimentId = useExperimentStore.getState().currentExperimentId;

  if (!experimentId) {
    return Promise.reject(new Error("未选择实验"));
  }

  const response = await request.get<DoingTask[]>(API.experiment.doing(experimentId));
  return response || [];
}

/**
 * 获取实验后题目列表
 */
export async function getPostExperimentQuestions(): Promise<PostExamRaw[]> {
  const experimentId = useExperimentStore.getState().currentExperimentId;

  if (!experimentId) {
    return Promise.reject(new Error("未选择实验"));
  }

  const response = await request.get<PostExamRaw[]>(
    API.experiment.post(experimentId),
  );
  return response || [];
}

/**
 * 获取所有实验阶段
 */
export async function getExperimentStages(): Promise<UserExperimentStage[]> {
  return request.get<UserExperimentStage[]>(API.experiment.stages);
}
/**
 * 进入实验，获取当前阶段和相关信息
 */
export async function enterExperiment(
  experimentId: number,
): Promise<{ current_stage: number }> {
  return request.get<{ current_stage: number }>(API.experiment.enter(experimentId));
}

/**
 * 获取实验列表
 */
export async function getExperimentList() {
  return request.get<ExperimentItem[]>(API.experiment.details);
}

/**
 *  检查实验中阶段是否达标，是否可以进入实验后阶段
 */
export async function checkDoingStageDone(
  experimentId: number,
): Promise<{ can_move: boolean; message: string }> {
  try {
    const res = await request.get<{ can_move: boolean; message: string }>(
      API.experiment.checkDoingDone(experimentId),
    );
    return res;
  } catch (error) {
    console.error("checkDoingStageDone failed", error);
    return { can_move: false, message: "检查失败，请稍后重试" };
  }
}

/**
 * 获取实验总结 (后端返回 {data: summary})
 */
export async function getExperimentSummary(
  experimentId: number | string,
): Promise<ExperimentSummary | null> {
  const response = await request.get<ExperimentSummary | null>(
    API.experiment.summary(experimentId),
  );
  return response || null;
}

/**
 * 提交实验总结（保存草稿或最终提交）
 */
export async function submitExperimentSummary(
  experimentId: number | string,
  data: {
    learning_content: string;
    problems_solved: string;
    action: "save" | "submit";
  },
) {
  return request.post(API.experiment.summary(experimentId), data);
}

/**
 * 获取操作评分 (后端返回 {data: {operation_score: 45}})
 */
export async function getOperationResult(experimentId: number | string) {
  return request.get<OperationResult>(
    API.experiment.operationResult(experimentId),
  );
}

/**
 * 上传实验报告文件
 */
export async function uploadExperimentReport(formData: FormData) {
  return request.post(API.experiment.uploadReport, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
