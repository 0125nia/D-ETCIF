// Package post
// D-ETCIF-frontend/src/components/student/stage/post/PostStageScore.tsx
import { useState, useEffect } from "react";
import Card from "@/components/common/Card";
import { getOperationResult } from "@/services/experiment";

import { useParams } from "react-router-dom";

export default function PostStageScore({ score }: { score: number | null }) {
  const { experimentId } = useParams<{ experimentId: string }>();

  // 1. 实验操作分（原本硬编码的 45），现在改为从后端动态获取
  const [expOperationScore, setExpOperationScore] = useState<number>(0);
  const [backendPostScore, setBackendPostScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperationScore = async () => {
      if (!experimentId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getOperationResult(experimentId);
        console.log("获取操作评分结果:", res);
        if (res) {
          setExpOperationScore(res.behavior_score || 40);
          setBackendPostScore(res.post_score || 0);
        }
      } catch (err) {
        console.error("获取操作评分失败", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperationScore();
  }, [experimentId]);

  // 2. 动态计算小测成绩（占 40%）
  const realExamScore = score !== null ? score * 0.4 : backendPostScore;

  // 3. 计算总成绩（操作分占 60%，小测分占 40%，或者按后端返回的权重计算）
  // 这里暂时沿用你的逻辑：操作分(满分60) + 小测折合分(满分40)
  const totalScore = (expOperationScore + realExamScore).toFixed(1);

  if (loading) return <Card title="实验评分查看">评分加载中...</Card>;

  return (
    <Card title="实验评分查看" className="">
      <div className="p-4">
        <div className="text-center py-10">
          <h2
            className={`text-2xl font-bold ${score === null ? "text-gray-400" : "text-green-600"}`}
          >
            {score === null ? "等待小测" : `${totalScore} 分`}
          </h2>
          <p className="text-gray-500 mt-2">
            状态：{score === null ? "正在进行小测" : "评分已生成"}
          </p>

          <div className="mt-4 p-4 bg-gray-50 rounded text-left space-y-2">
            <p className="border-b pb-1 mb-2 font-medium">评分细则：</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">实验操作（伴随式评价）：</span>
              <span className="font-mono">
                {expOperationScore.toFixed(1)} / 60
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">实验小测（自动阅卷）：</span>
              <span className="font-mono">
                {score === null ? (
                  <span className="text-gray-400">未完成</span>
                ) : (
                  <span className="text-blue-700">
                    {realExamScore.toFixed(1)} / 40
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
