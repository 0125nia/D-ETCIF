// src/components/postStage/PostStageScore.tsx
import Card from "@/components/common/Card";

export default function PostStageScore({ score }: { score: number | null }) {
  const ExpScore = 45;
  const RealExamScore = score !== null ? (score * 0.4).toFixed(1) : null;
  return (
    <Card title="实验评分查看" className="">
      <div className="p-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-green-600">
            {score === null
              ? "未考试"
              : `${(ExpScore + parseFloat(RealExamScore!)).toFixed(1)}分`}
          </h2>
          <p className="text-gray-500 mt-2">实验完成时间：2026-03-07</p>
          <div className="mt-4 p-4 bg-gray-50 rounded text-left">
            <p>
              <strong>评分项：</strong>
            </p>
            <p>• 实验操作：{ExpScore}/60</p>
            <p>
              • 小测成绩：
              {score === null ? (
                <span className="text-gray-500">未考试</span>
              ) : (
                <span className="text-blue-700">{RealExamScore}/40</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
