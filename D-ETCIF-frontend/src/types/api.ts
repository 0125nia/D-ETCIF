// 标准API响应类型
export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
}

// 简化的API响应类型（用于直接返回业务数据）
export type ApiData<T> = T;
