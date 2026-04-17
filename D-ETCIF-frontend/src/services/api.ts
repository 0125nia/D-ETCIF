// Package services
// D-ETCIF-frontend/src/services/api.ts
// Package services

// D-ETCIF-frontend/src/services/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API = {
  login: "/api/auth/login",
  student: {
    feedback: {
      list: "/api/student/feedback",
    },
    profile: {
      cognitiveMap: "/api/student/profile/cognitive-map",
      studyReport: "/api/student/profile/report",
      recommendations: "/api/student/profile/recommendations",
    },
  },
  experiment: {
    // 基础实验信息
    details: "/api/student/experiment/details",
    stages: "/api/student/experiment/stages",
    updateStage: "/api/student/experiment/stage/update",
    enter: (experiment_id: number) =>
      `/api/student/experiment/enter/${experiment_id}`,

    //实验数据
    pre: (experiment_id: number) =>
      `/api/student/experiment/pre/${experiment_id}`,
    doing: (experiment_id: number) =>
      `/api/student/experiment/doing/${experiment_id}`,
    post: (experiment_id: number) =>
      `/api/student/experiment/post/${experiment_id}`,

    checkDoingDone: (experiment_id: number) =>
      `/api/student/experiment/check-doing/${experiment_id}`,

    // 结果产出
    summary: (experiment_id: number | string) =>
      `/api/student/experiment/summary/${experiment_id}`,
    operationResult: (experiment_id: number | string) =>
      `/api/student/experiment/operation-result/${experiment_id}`,
    uploadReport: "/api/student/experiment/upload-report", // 通常上传路径是固定的，ID 放在 FormData 里
  },
  teacher: {
    experiment: {
      details: "/api/teacher/experiment/details",
    },
    report: {
      // 全班概览
      results: (expId: number | string) =>
        `/api/teacher/experiment/results/${expId}`,
      // 单个学生详情 (注意：后端实现是 Query 参数)
      detail: "/api/teacher/experiment/result/detail",
    },
    dashboard: {
      heatmap: "/api/teacher/dashboard/heatmap",
      warning: "/api/teacher/dashboard/warning",
      behavior: "/api/teacher/dashboard/behavior",
    },
  },
  help: {
    teacherList: "/api/teacher/help",
    studentSubmit: "/api/student/help",
  },
};
