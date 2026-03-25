import { useState } from "react";
import PageContainer from "@/components/common/PageContainer";
import { AsideMainLayout } from "@/layouts";
import { PreStageAside, PreStageMain } from "@/components/student";
import type { ResourceItem } from "@/types/domain/resource";



export default function PreStagePage() {
  // 存储选中的资源
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  return (
    <PageContainer title="实验后代码编写页面">
      <AsideMainLayout
        aside={
          <PreStageAside
            selectedResource={selectedResource}
            onSelect={setSelectedResource}
          />
        }
        main={<PreStageMain resource={selectedResource} />}
      />
    </PageContainer>
  );
}