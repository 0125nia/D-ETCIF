// Package types
// D-ETCIF-frontend/src/types/experimentData.ts
export interface ResourceItem {
  id: number;
  name: string;
  children?: ResourceItem[];
  url?: string;
  type?: "pdf" | "image" | "text" | "html" | "video";
}

export interface PreExperimentData {
  id: number;
  experiment_id: number;
  experiment_name: string;
  source_name: string; // 父菜单名
  source_child_name: string; // 子菜单名
  url: string;
  type: "pdf" | "image" | "text" | "html" | "video";
}

export interface DoingTask {
  id: number;
  experiment_id: number;
  experiment_name: string;
  topic_details: string;
}

export interface PostExamRaw {
  id: number;
  experiment_id: number;
  experiment_name: string;
  questions: string;
  options: string; // 后端返回的原始 JSON 字符串
  answer: string;
}

export interface PostExamParsed {
  id: number;
  question: string;
  options: string[]; // 解析后的数组
  answer: string;
}

export interface PostSummaryData {
  learning_content: string; // 本次实验学到了什么
  problems_solved: string; // 遇到的问题与解决方法
  updated_at?: string;
}

export interface PostTaskItem {
  id: number;
  title: string;
  children?: PostTaskItem[];
  // 用于匹配右侧组件
  type: "summary" | "exam";
}
