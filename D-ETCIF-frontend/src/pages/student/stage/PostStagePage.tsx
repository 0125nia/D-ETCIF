import { useState } from "react";
import { ThreeColumnLayout } from "@/layouts";
import { PageContainer } from "@/components/common";

import PostStageLeft from "@/components/student/stage/post/PostStageLeft";
import PostStageRight from "@/components/student/stage/post/PostStageRight";

import {
  PostStageMain,
  PostStageSummary,
  PostStageExam,
} from "@/components/student";

// 从左侧组件导入类型
import type { PostTaskItem } from "@/types/domain/post";

type ContentType = "default" | PostTaskItem["type"];

// 👇 类型安全的映射表
const CONTENT_MAP: Record<ContentType, React.ReactElement> = {
  default: <PostStageMain />,
  summary: <PostStageSummary />,
  exam: <PostStageExam />,
};

export default function PostStagePage() {
  const [activeItem, setActiveItem] = useState<PostTaskItem | null>(null);

  const currentType = (activeItem?.type ?? "default") as ContentType;

  return (
    <PageContainer title="实验后答题与实验报告页面">
      <ThreeColumnLayout
        left={<PostStageLeft onItemClick={setActiveItem} />}
        center={CONTENT_MAP[currentType]}
        right={<PostStageRight />}
      />
    </PageContainer>
  );
}
