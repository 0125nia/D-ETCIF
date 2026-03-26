// 树结构类型
export interface PostTaskItem {
  id: number;
  title: string;
  children?: PostTaskItem[];
  // 用于匹配右侧组件
  type: "summary" | "exam";
}
