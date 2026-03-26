// src/components/postStage/PostStageScore.tsx
import Card from "@/components/common/Card";

export default function PostStageScore() {
  return (
    <Card title="实验评分查看" className="">
      <div className="p-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-green-600">85 分</h2>
          <p className="text-gray-500 mt-2">实验完成时间：2026-03-07</p>
          <div className="mt-4 p-4 bg-gray-50 rounded text-left">
            <p>
              <strong>评分项：</strong>
            </p>
            <p>• 实验操作：45/60</p>
            <p>• 小测成绩：40/40</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
