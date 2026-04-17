// Package base
// D-ETCIF-frontend/src/components/base/StageTag.tsx
import { useAuthStore, useExperimentStore } from "@/store";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/common";

import { useState } from "react";

const StageTag = () => {
  const { role } = useAuthStore();
  const {
    currentStage,
    currentExperimentId,
    startDoing,
    finishExperiment,
    checkCanMoveToPost,
  } = useExperimentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // 检查当前路径是否在实验的三个阶段页面
  const isExperimentStagePage =
    location.pathname.includes("/student/lab/pre/") ||
    location.pathname.includes("/student/lab/doing/") ||
    location.pathname.includes("/student/lab/post/");

  if (
    role === "teacher" ||
    !currentStage ||
    !currentExperimentId ||
    !isExperimentStagePage
  ) {
    return null;
  }

  const map = {
    PRE: "实验前",
    DOING: "实验中",
    POST: "实验后",
  };

  const handleNext = async () => {
    const labId = currentExperimentId;
    if (currentStage === "PRE") {
      // 实验前 -> 实验中 (无条件)
      startDoing();
      navigate(`/student/lab/doing/${labId}`);
    } else if (currentStage === "DOING") {
      setLoading(true);
      try {
        const canMove = await checkCanMoveToPost();
        if (canMove) {
          finishExperiment();
          navigate(`/student/lab/post/${labId}`);
        } else {
          navigate(`/student/lab/post/${labId}`);
        }
      } finally {
        setLoading(false); // 关闭 loading
      }
    }
  };

  const handlePrev = () => {
    const labId = currentExperimentId;
    if (currentStage === "DOING") {
      // 回到实验前，仅状态回流，不触发额外逻辑
      useExperimentStore.setState({ currentStage: "PRE" });
      navigate(`/student/lab/pre/${labId}`);
    } else if (currentStage === "POST") {
      // 回到实验中
      useExperimentStore.setState({ currentStage: "DOING" });
      navigate(`/student/lab/doing/${labId}`);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* 状态展示 */}
      <div className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 font-medium border border-blue-100">
        当前阶段: {map[currentStage]}
      </div>

      {/* 按钮控制组 */}
      <div className="flex items-center gap-2">
        {currentStage !== "PRE" && (
          <Button
            variant="ghost"
            onClick={handlePrev}
            className="h-8 py-0 px-3 border border-gray-300 text-gray-600 hover:text-gray-800"
          >
            上一步
          </Button>
        )}

        {currentStage !== "POST" && (
          <Button
            loading={loading}
            variant="primary"
            onClick={handleNext}
            className="h-8 py-0 px-3"
          >
            {currentStage === "PRE" ? "开始实验" : "完成实验"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StageTag;
