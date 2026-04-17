// Package stage
// D-ETCIF-frontend/src/pages/student/stage/PostStagePage.tsx
import { useState, type ComponentType } from "react";
import { ThreeColumnLayout } from "@/layouts";
import { PageContainer } from "@/components/common";

import PostStageLeft from "@/components/student/stage/post/PostStageLeft";
import PostStageRight from "@/components/student/stage/post/PostStageRight";

import { PostStageSummary, PostStageExam } from "@/components/student";

// 从左侧组件导入类型
import type { PostTaskItem } from "@/types";

type ContentType = "default" | PostTaskItem["type"];

const CONTENT_MAP: Record<ContentType, ComponentType> = {
  default: PostStageExam,
  summary: PostStageSummary,
  exam: PostStageExam,
};

export default function PostStagePage() {
  const [activeItem, setActiveItem] = useState<PostTaskItem | null>(null);

  const currentType = (activeItem?.type ?? "default") as ContentType;
  const ActiveContent = CONTENT_MAP[currentType];
  return (
    <PageContainer title="实验后答题与实验报告页面">
      <ThreeColumnLayout
        left={<PostStageLeft onItemClick={setActiveItem} />}
        center={<ActiveContent />}
        right={<PostStageRight />}
      />
    </PageContainer>
  );
}
