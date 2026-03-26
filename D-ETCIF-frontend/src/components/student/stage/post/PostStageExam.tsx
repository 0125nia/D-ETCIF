// src/components/postStage/PostStageExam.tsx
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import type { ExamQuestion } from "@/types/domain/exam";
import { useState } from "react";
import { toast } from "@/store";
import eventBus from "@/utils/eventBus";

const sampleQuestions: ExamQuestion[] = [
  {
    id: 1,
    question: "关于数据可视化的定义与作用，下列说法错误的是：",
    options: [
      "A. 数据可视化是从数据空间到图形空间的映射过程",
      "B. 数据可视化仅用于展示已知信息，无法挖掘未知信息",
      "C. 借助图形化手段可以传递数据关系与规律",
      "D. 常见的可视化方式包括折线图、柱形图、散点图等",
    ],
    answer: "B. 数据可视化仅用于展示已知信息，无法挖掘未知信息",
  },
  {
    id: 2,
    question: "在 Python 数据可视化库中，被称为“鼻祖”且支持 2D/3D 绘图的库是：",
    options: ["A. Seaborn", "B. Pyecharts", "C. Matplotlib", "D. Bokeh"],
    answer: "C. Matplotlib",
  },
  {
    id: 3,
    question:
      "Matplotlib 提供了多种 API 风格，其中官方已弃用，不再推荐使用的是：",
    options: [
      "A. pyplot API",
      "B. object-oriented API",
      "C. pylab API",
      "D. matplotlib.pyplot 模块",
    ],
    answer: "C. pylab API",
  },
  {
    id: 4,
    question:
      "在数据可视化中，根据数据关系选择图表至关重要。若要展示连续型数据的分布情况，通常首选______图；若要展示各部分占整体的比例（构成关系），通常首选______图。",
    options: [],
    answer: "直方；饼",
  },
  {
    id: 5,
    question:
      "请简述 Matplotlib 图形对象的层次结构中，“容器层”主要包含哪三个核心对象？",
    options: [],
    answer: "Canvas（画布）、Figure（图形）、Axes（坐标系）",
  },
];

export default function PostStageExam() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, boolean>>({});

  const handleRadioChange = (qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleTextChange = (qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const resultDetails: Record<number, boolean> = {};
    sampleQuestions.forEach((q) => {
      const userAnswer = answers[q.id] || "";
      const isCorrect = userAnswer === q.answer;
      resultDetails[q.id] = isCorrect;
      if (isCorrect) correctCount++;
    });
    const totalScore = (correctCount / sampleQuestions.length) * 100;

    setResults(resultDetails);
    setScore(totalScore);
    toast.success(`提交成功！成绩：${totalScore}分`);

    eventBus.emit("examScoreUpdate", {
      score: totalScore,
      completed: true,
    });
  };

  // 在 handleReset 里重置
  const handleReset = () => {
    setAnswers({});
    setScore(null);
    setResults({});

    eventBus.emit("examScoreUpdate", {
      score: null,
      completed: false,
    });
  };

  return (
    <Card title="实验小测 - 答题区域">
      <div className="h-[750px] overflow-y-auto pr-2 space-y-6 pb-4">
        {sampleQuestions.map((q) => (
          <div key={q.id} className="p-4 border rounded-lg break-words">
            <h3 className="font-medium text-gray-800 mb-3">
              {q.id}. {q.question}
              {results[q.id] !== undefined && (
                <span
                  className={`ml-2 text-sm ${results[q.id] ? "text-green-600" : "text-red-600"}`}
                >
                  {results[q.id] ? "✓ 正确" : "✗ 错误"}
                </span>
              )}
            </h3>

            {q.options && q.options.length > 0 ? (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleRadioChange(q.id, opt)}
                      disabled={score !== null}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full border border-gray-200 rounded p-3 h-32 resize-none box-border"
                placeholder="请输入答案..."
                value={answers[q.id] || ""}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                disabled={score !== null}
              />
            )}

            {score !== null && (
              <div className="mt-2 text-sm text-gray-600">
                正确答案：<span className="text-blue-600">{q.answer}</span>
              </div>
            )}
          </div>
        ))}

        {score !== null && (
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <h2 className="text-xl font-bold text-blue-700">
              最终成绩：{score} 分
            </h2>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t flex gap-3">
        {score === null ? (
          <Button variant="primary" onClick={handleSubmit}>
            提交答案并评分
          </Button>
        ) : (
          <Button variant="primary" onClick={handleReset}>
            重新考试
          </Button>
        )}
        <Button variant="ghost">保存草稿</Button>
      </div>
    </Card>
  );
}
