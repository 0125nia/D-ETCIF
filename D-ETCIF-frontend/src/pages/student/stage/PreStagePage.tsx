import { useState } from "react";
import PageContainer from "@/components/common/PageContainer";
import { AsideMainLayout } from "@/layouts";
import { PreStageAside, PreStageMain } from "@/components/student";
import type { ResourceItem } from "@/types/domain/resource";
import { trackPreEvent } from "@/services/tracker";
import { useExperimentStore } from "@/store/experiment.store";

export default function PreStagePage() {
  // 存储选中的资源
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const currentExperimentId = useExperimentStore((s) => s.currentExperimentId);

  const handleSelectResource = (item: ResourceItem) => {
    setSelectedResource(item);
    
    // 触发预习埋点：资源点击
    trackPreEvent({
      experiment_id: currentExperimentId ? currentExperimentId.toString() : "unknown",
      resource_id: item.id.toString(),
      resource_name: item.name,
      path: item.url || "unknown",
      duration: 0,
    }).catch(console.error);
  };

  return (
    <PageContainer title="实验前代码编写页面">
      <AsideMainLayout
        aside={
          <PreStageAside
            selectedResource={selectedResource}
            onSelect={handleSelectResource}
          />
        }
        main={<PreStageMain resource={selectedResource} />}
      />
    </PageContainer>
  );
}