import { AsideMainLayout } from "@/layouts";
import { PageContainer } from "@/components/common";
import { CorrectAside, CorrectMain } from "@/components/teacher";
export default function Correct() {
  return (
    <PageContainer title="">
      <AsideMainLayout aside={<CorrectAside />} main={<CorrectMain />} />
    </PageContainer>
  );
}
