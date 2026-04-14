// Package post
// D-ETCIF-frontend/src/components/student/stage/post/PostStageLeft.tsx
import Card from "@/components/common/Card";
import List from "@/components/common/List";
import type { PostTaskItem } from "@/types";

interface Props {
  onItemClick: (item: PostTaskItem) => void;
}

export default function PostStageLeft({ onItemClick }: Props) {
  const treeData: PostTaskItem[] = [
    {
      id: 1,
      title: "小测",
      type: "exam",
    },
    {
      id: 2,
      title: "实验总结",
      type: "summary",
    },
  ];

  return (
    <Card title="实验任务" className="h-full">
      <List
        data={treeData}
        defaultExpandAll
        renderItem={(item) => (
          <div
            className="text-gray-700 hover:text-blue-600 cursor-pointer py-1 px-1 rounded"
            onClick={() => onItemClick(item)}
          >
            {item.title}
          </div>
        )}
      />
    </Card>
  );
}
