// Package types
// D-ETCIF-frontend/src/types/feedback.ts
export type FeedbackType = "即时提醒" | "思路引导" | "长期补救";
export type FeedbackSeverity = "warning" | "error" | "success";

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  content: string;
  severity: FeedbackSeverity;
  createdAt: number;
  codeSnippet?: string;
  knowledgeLink?: string;
}

export interface FeedbackItem {
  id: number;
  name: string;
  feedbacks?: Feedback[];
}
