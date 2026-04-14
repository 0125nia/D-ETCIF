// Package stage
// D-ETCIF-frontend/src/pages/student/stage/DoingStagePage.tsx
import { PageContainer } from "@/components/common";
import ThreeColumnLayout from "@/layouts/ThreeColumnLayout";
import {
  DoingStageLeft,
  DoingStageMain,
  DoingStageRight,
} from "@/components/student";

export default function DoingStagePage() {
  return (
    <PageContainer title="实验中代码编写页面">
      <ThreeColumnLayout
        left={<DoingStageLeft />}
        center={<DoingStageMain />}
        right={<DoingStageRight />}
      />
    </PageContainer>
  );
}
