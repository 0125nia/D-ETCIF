import PageContainer from "@/components/common/PageContainer";
import { AsideMainLayout } from "@/layouts";
import { PreStageAside, PreStageMain } from "@/components/student";
export default function PreStagePage() {
  return (
    <PageContainer title="实验后代码编写页面">
      <AsideMainLayout aside={<PreStageAside />} main={<PreStageMain />} />
    </PageContainer>
  );
}
