import { AsideMainLayout } from "@/layouts";
import { PageContainer } from "@/components/common";
import { HelpAside, HelpMain } from "@/components/teacher";
export default function HelpPage() {
  return (
    <PageContainer title="">
      <AsideMainLayout aside={<HelpAside />} main={<HelpMain />} />
    </PageContainer>
  );
}
