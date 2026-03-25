import { PageContainer, Card } from "@/components/common";

// 模拟实验数据
const experiments = [
  { id: 1, name: "第1章 数据可视化与matplotlib" ,desc: "", difficulty: ""},
  { id: 8, name: "实验2" },
  { id: 9, name: "实验3" },
  { id: 10, name: "实验4" },
];

export default function LabPage() {
  return (
    <PageContainer title="">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 遍历数据生成卡片 */}
        {experiments.map((exp) => (
          <Card
            key={exp.id}
            title={exp.name}
            // 这里可以给每个实验卡片设置特定样式或点击事件
            className=""
          >
            <div className="bg-white rounded-xl p-5 flex flex-col gap-3">
              <p className="text-gray-500 text-sm">desc</p>

              <div className="text-sm text-gray-600">难度：difficulty</div>

              <button
                onClick={() => {}}
                className="mt-auto bg-indigo-500 text-white rounded px-3 py-2"
              >
                进入实验
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
