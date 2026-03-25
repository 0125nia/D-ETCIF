import { Card } from "@/components/common";
import { useState } from "react";

export default function DoingStageLeft() {
  // 控制折叠展开状态
  const [open1, setOpen1] = useState(true);
  const [open2, setOpen2] = useState(false);

  return (
    <Card title="实验要求" className="h-full overflow-y-auto">
      <div
        className="text-gray-700 space-y-5"
        style={{
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
          lineHeight: "1.8",
          fontSize: "15px",
        }}
      >
        {/* ===================== 题目 1 ===================== */}
        <div className="border rounded-lg overflow-hidden">
          <div
            className="bg-gray-100 px-4 py-3 font-bold cursor-pointer flex justify-between items-center"
            onClick={() => setOpen1(!open1)}
          >
            题目 1：基础环境准备与数据读取
            <span>{open1 ? "▲" : "▼"}</span>
          </div>

          {open1 && (
            <div className="p-4 whitespace-pre-wrap text-gray-600">
              教学目标：掌握库导入、中文设置、Excel 数据读取
              <br />
              <br />
              请完成以下基础操作：
              <br />
              1. 导入 numpy、pandas、matplotlib.pyplot 库，并从 pandas 导入 DataFrame、Series；
              <br />
              2. 设置 matplotlib 中文显示为黑体（SimHei），并修正坐标轴负号显示问题；
              <br />
              3. 读取 data(1).xlsx 文件中的 “平均成绩” 工作表，赋值给变量 df_score；
              <br />
              　 读取 “销售额” 工作表，赋值给变量 df_sales；
              <br />
              4. 分别打印两个 DataFrame 的前 3 行，验证数据读取是否正确。
            </div>
          )}
        </div>

        {/* ===================== 题目 2 ===================== */}
        <div className="border rounded-lg overflow-hidden">
          <div
            className="bg-gray-100 px-4 py-3 font-bold cursor-pointer flex justify-between items-center"
            onClick={() => setOpen2(!open2)}
          >
            题目 2：绘制堆叠柱状图
            <span>{open2 ? "▲" : "▼"}</span>
          </div>

          {open2 && (
            <div className="p-4 whitespace-pre-wrap text-gray-600">
              教学目标：理解 plt.bar() 的 bottom 参数，掌握数据标注
              <br />
              <br />
              基于 df_score 数据，完成堆叠柱状图绘制：
              <br />
              1. 提取数据：sign 为班级列（第 0 列），boy 为男生成绩列（第 1 列），girl 为女生成绩列（第 2 列）；
              <br />
              2. 绘制男生柱子：x 轴为 sign，高度为 boy，颜色绿色（color='g'），透明度 0.6，标签 “男生”；
              <br />
              3. 绘制女生柱子：x 轴为 sign，高度为 girl，堆叠在男生柱子上方（bottom 参数），透明度 0.5，标签 “女生”；
              <br />
              4. 添加 y 轴标签 “平均成绩 (分)”、标题 “高二男生、女生的平均成绩”，并显示图例；
              <br />
              5. 在每个柱子上方标注对应成绩数值（plt.text()）。
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}