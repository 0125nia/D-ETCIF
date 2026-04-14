export interface HelpDetail {
  id: number;
  user_id: number;
  username?: string; // 可选，如果后端做了关联查询建议带上
  experiment_id: number;
  experiment_stage: string; // 对应 PRE / DOING / POST
  title: string;
  content: string;
  status?: number; // 0: 待处理, 1: 已解决 (建议预留)
  created_at?: number; // Unix 时间戳
}
