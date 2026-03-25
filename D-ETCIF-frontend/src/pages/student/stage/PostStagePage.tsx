import { PageContainer } from "@/components/common";

import {ThreeColumnLayout} from "@/layouts";
import {PostStageLeft,PostStageMain,PostStageRight} from "@/components/student";
export default function PostStagePage() {
  return (
    <PageContainer title="实验后答题与实验报告页面">
      <ThreeColumnLayout
        left={<PostStageLeft />}
        center={<PostStageMain />}
        right={<PostStageRight />}
      />
    </PageContainer>
  );
}
