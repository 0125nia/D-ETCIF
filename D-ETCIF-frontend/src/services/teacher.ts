import { request } from "@/services/requests";
import { API } from "./api";
import type { ExperimentItem } from "@/types/experiment";
import type { StudentExperimentOverview, StudentResultDetail } from "@/types";

/**
 * 获取教师端实验列表
 */
export async function getTeacherExperimentList(): Promise<ExperimentItem[]> {
  const res = await request.get<ExperimentItem[]>(API.teacher.experiment.details);
  return res;
}

/**
 * 获取全班实验概览
 * @param experimentId 实验ID
 */
export async function getAllStudentResults(experimentId: number | string): Promise<StudentExperimentOverview[]> {
  const res = await request.get<StudentExperimentOverview[]>(
    API.teacher.report.results(experimentId),
  );
  return res;
}

/**
 * 获取特定学生的详细实验产出
 * @param studentId 学生ID
 * @param experimentId 实验ID
 */
export async function getStudentResultDetail(
  studentId: number,
  experimentId: number,
): Promise<StudentResultDetail> {
  const res = await request.get<StudentResultDetail>(API.teacher.report.detail, {
    params: {
      student_id: studentId,
      experiment_id: experimentId,
    },
  });
  return res;
}

/**
 * 构建报告下载/预览地址
 */
export function getReportDownloadUrl(filePath: string): string {
  if (!filePath) return "";
  // 后端存储路径为 ./static/uploads/... 映射到 Web 路径通常去掉开头的 ./static
  // 假设后端 Static("/uploads", "./static/uploads")
  const fileName = filePath.split("/").pop();
  return `${import.meta.env.VITE_API_BASE_URL}/uploads/${fileName}`;
}
