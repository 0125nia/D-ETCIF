import { PageContainer, Card } from "@/components/common";

// 模拟实验数据
const experiments = [
  {
    id: 1,
    name: "第 1 章 数据可视化与 matplotlib",
    desc: "介绍数据可视化的基础概念、常见可视化方式与图表选择逻辑，讲解 Python 主流数据可视化库特性，重点阐述 matplotlib 的基础认知、安装方法及两种核心绘图方式，同时说明 matplotlib 绘图的图形层次结构",
    difficulty: "入门",
  },
  {
    id: 2,
    name: "第 2 章 使用 matplotlib 绘制简单图表",
    desc: "详细讲解 matplotlib 中各类基础图表的绘制方法，包括折线图、柱形图 / 堆积柱形图、条形图 / 堆积条形图等十余种图表，掌握各图表对应的绘图函数、参数配置及实际应用场景",
    difficulty: "基础",
  },
  {
    id: 3,
    name: "第 3 章 图表辅助元素的定制",
    desc: "讲解 matplotlib 图表中各类辅助元素的定制方法，包括坐标轴标签、刻度、标题、图例等，通过添加和配置辅助元素让图表更易读、信息更完整，掌握各辅助元素对应的函数与参数配置",
    difficulty: "基础",
  },
  {
    id: 4,
    name: "第 4 章 图表样式美化",
    desc: "讲解 matplotlib 图表的样式美化方法，包括颜色使用、线型选择、数据标记添加、字体设置、主题切换和区域填充，通过多种方式修改图表样式，提升图表的视觉效果和可读性",
    difficulty: "基础",
  },
  {
    id: 5,
    name: "第 5 章 子图的绘制及坐标轴共享",
    desc: "讲解 matplotlib 中多子图的绘制方法，包括固定区域和自定义区域子图，同时掌握子图的坐标轴共享方式和布局调整技巧，实现多图表在同一画布的合理展示",
    difficulty: "中等",
  },
  {
    id: 6,
    name: "第 6 章 坐标轴的定制",
    desc: "深入讲解 matplotlib 坐标轴的高级定制方法，包括坐标轴的结构认知、自定义添加坐标轴、刻度定制、轴脊的隐藏与移动，实现坐标轴的灵活配置以适配各类图表需求",
    difficulty: "中等",
  },
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
              <p className="text-gray-500 text-sm">{exp.desc}</p>

              <div className="text-sm text-gray-600">
                难度：{exp.difficulty}
              </div>

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
