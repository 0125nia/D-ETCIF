export interface HelpDetail {
  id: number;
  user_id: number;
  username?: string; // 可选，如果后端做了关联查询建议带上
  experiment_id: number;
  experiment_stage: number | string; // 兼容后端数值阶段与历史字符串阶段
  title: string;
  content: string;
  status?: number; // 0: 待处理, 1: 已解决 (建议预留)
  created_at?: number; // Unix 时间戳
}
