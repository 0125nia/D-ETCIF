// Package post
// D-ETCIF-frontend/src/components/student/stage/post/PostStageRight.tsx
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
      <PostStageScore score={examScore} />
      <ReportUpload />
    </div>
  );
}
