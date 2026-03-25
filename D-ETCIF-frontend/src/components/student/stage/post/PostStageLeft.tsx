import Card from "@/components/common/Card";
import List from "@/components/common/List";

// 树结构数据类型（匹配你的 List 组件）
interface TaskItem {
  id: number;
  title: string;
  children?: TaskItem[];
}

export default function PostStageLeft() {
  // 实验后任务树
  const treeData: TaskItem[] = [
    {
      id: 1,
      title: "实验总结",
      children: [
        { id: 11, title: "实验结论填写" },
        { id: 12, title: "问题与反思" },
      ],
    },
    {
      id: 2,
      title: "实验报告",
      children: [
        { id: 21, title: "上传报告文件" },
        { id: 22, title: "提交审核" },
      ],
    },
    { id: 3, title: "实验评分查看" },
  ];

  return (
    <Card title="实验任务" className="h-full">
      <List
        data={treeData}
        defaultExpandAll
        renderItem={(item) => (
          <div className="text-gray-700 hover:text-blue-600 cursor-pointer py-1">
            {item.title}
          </div>
        )}
      />
    </Card>
  );
};