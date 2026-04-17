// Package base
// D-ETCIF-frontend/src/components/base/HelpModal.tsx
import { useState } from "react";
import { toast } from "@/store";
import { useAuthStore, useExperimentStore } from "@/store";
import { submitHelp } from "@/services/help";
import type { Stage } from "@/types";

export default function HelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentExperimentId, currentStage } = useExperimentStore();
  const user = useAuthStore((s) => s.user);

  if (!open) return null;

  const stageToNumber = (stage: Stage | null): number | null => {
    if (!stage) return null;
    if (stage === "PRE") return 1;
    if (stage === "DOING") return 2;
    if (stage === "POST") return 3;
    return null;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.warning("请填写完整求助信息");
      return;
    }
    const experimentStage = stageToNumber(currentStage);
    if (!user?.id || !currentExperimentId || !experimentStage) {
      toast.error("实验上下文不完整，无法提交求助");
      return;
    }

    try {
      setLoading(true);
      await submitHelp({
        user_id: user.id,
        experiment_id: currentExperimentId,
        experiment_stage: experimentStage,
        title: title.trim(),
        content: content.trim(),
        status: 0,
      });

      toast.success("求助提交成功");

      setTitle("");
      setContent("");
      onClose();
    } catch {
      toast.error("提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[420px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">提交求助</h2>

        {/* 标题 */}
        <input
          className="w-full border rounded-md px-3 py-2 mb-3 outline-none focus:border-blue-500"
          placeholder="请输入求助标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 内容 */}
        <textarea
          className="w-full border rounded-md px-3 py-2 h-28 resize-none outline-none focus:border-blue-500"
          placeholder="请输入具体问题描述"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 按钮区 */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            className="px-4 py-2 text-gray-600"
            onClick={onClose}
            disabled={loading}
          >
            取消
          </button>

          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "提交中..." : "提交求助"}
          </button>
        </div>
      </div>
    </div>
  );
}
