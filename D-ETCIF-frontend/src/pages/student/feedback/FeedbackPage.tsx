// Package feedback
// D-ETCIF-frontend/src/pages/student/feedback/FeedbackPage.tsx
import PageContainer from "@/components/common/PageContainer";
import { AsideMainLayout } from "@/layouts";
import { FeedbackAside, FeedbackMain } from "@/components/student";

export default function FeedbackPage() {
  return (
    <PageContainer>
      <AsideMainLayout aside={<FeedbackAside />} main={<FeedbackMain />} />
    </PageContainer>
  );
}
