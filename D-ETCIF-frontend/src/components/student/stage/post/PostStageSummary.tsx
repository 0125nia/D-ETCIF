// Package post
// D-ETCIF-frontend/src/components/student/stage/post/PostStageSummary.tsx
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { useState, useEffect } from "react";
import {
  getExperimentSummary,
  submitExperimentSummary,
} from "@/services/experiment";
import { trackPostEvent } from "@/services/tracker";
import { useParams } from "react-router-dom";
import { toast } from "@/store";

// 实验总结内容组件
export default function PostStageSummary() {
  const { experimentId } = useParams<{ experimentId: string }>();

  const [summary, setSummary] = useState({
    learning_content: "",
    problems_solved: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false); // 追踪是否已提交最终版
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchDraft = async () => {
      if (!experimentId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // ✅ 使用服务层函数
        const summaryData = await getExperimentSummary(experimentId);
        if (summaryData) {
          const summary = summaryData;
          if (summary) {
            setSummary({
              learning_content: summary.learning_content || "",
              problems_solved: summary.problems_solved || "",
            });
            if (summary.status === "submitted") setIsSubmitted(true);
          }
        }
      } catch (err) {
        console.error("获取草稿失败", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDraft();
  }, [experimentId]);

  const handleAction = async (actionType: "save" | "submit") => {
    if (!experimentId) return;
    setSaveLoading(true);
    try {
      // ✅ 使用服务层函数
      await submitExperimentSummary(experimentId, {
        ...summary,
        action: actionType,
      });

      if (actionType === "submit") {
        trackPostEvent({
          experiment_id: experimentId,
          action_type: "post_reflection_submit",
          score: 0,
          content:
            `实验总结提交：${summary.learning_content} ${summary.problems_solved}`.trim(),
        }).catch(console.error);
        setIsSubmitted(true);
        toast.success("实验总结已提交，不可更改");
      } else {
        toast.success("草稿已保存");
      }
    } catch (err) {
      toast.error("操作失败，请重试");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Card title="实验总结">加载中...</Card>;

  return (
    <Card title="实验总结与报告编辑" className="h-full">
      <div className="space-y-4">
        {isSubmitted && (
          <div className="bg-amber-50 text-amber-600 p-2 rounded text-sm mb-4">
            您已提交最终版本，内容已锁定。
          </div>
        )}

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            本次实验你学到了什么？
          </label>
          <textarea
            className="w-full border border-gray-200 rounded p-3 h-40 resize-none focus:border-blue-400 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入你的实验总结..."
            value={summary.learning_content}
            onChange={(e) =>
              setSummary((prev) => ({
                ...prev,
                learning_content: e.target.value,
              }))
            }
            disabled={isSubmitted || saveLoading}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            遇到的问题与解决方法
          </label>
          <textarea
            className="w-full border border-gray-200 rounded p-3 h-32 resize-none focus:border-blue-400 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入问题描述..."
            value={summary.problems_solved}
            onChange={(e) =>
              setSummary((prev) => ({
                ...prev,
                problems_solved: e.target.value,
              }))
            }
            disabled={isSubmitted || saveLoading}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="primary"
            onClick={() => handleAction("save")}
            disabled={isSubmitted || saveLoading}
          >
            {saveLoading ? "处理中..." : "保存草稿"}
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              setSummary({ learning_content: "", problems_solved: "" })
            }
            disabled={isSubmitted || saveLoading}
          >
            重置
          </Button>

          <Button
            variant="danger"
            onClick={() => handleAction("submit")}
            disabled={isSubmitted || saveLoading}
          >
            提交最终版本
          </Button>
        </div>
      </div>
    </Card>
  );
}
