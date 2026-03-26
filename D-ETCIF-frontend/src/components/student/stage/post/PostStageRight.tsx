import PostStageScore from "./PostStageScore";
import { useState, useEffect } from "react";
import eventBus from "@/utils/eventBus";
import { ReportUpload } from "@/components/base";

export default function PostStageRight() {
  const [examScore, setExamScore] = useState<number | null>(null);

  useEffect(() => {
    const handleUpdate = (data: { score: number | null }) => {
      setExamScore(data.score);
    };

    eventBus.on("examScoreUpdate", handleUpdate);

    // 组件销毁时取消订阅，防止内存泄漏
    return () => {
      eventBus.off("examScoreUpdate", handleUpdate);
    };
  }, []);
  return (
    <div className="space-y-6 h-full">
      {/* 实验状态
      <Card title="实验状态">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>实验进度</span>
            <span className="text-blue-600">100%</span>
          </div>
          <div className="flex justify-between">
            <span>报告状态</span>
            <span className="text-orange-600">未提交</span>
          </div>
          <div className="flex justify-between">
            <span>评分状态</span>
            <span className="text-orange-600">未完成</span>
          </div>
        </div>
      </Card> */}

      <PostStageScore score={examScore} />
      <ReportUpload />
    </div>
  );
}
