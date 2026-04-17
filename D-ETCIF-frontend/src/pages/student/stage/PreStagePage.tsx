// Package stage
// D-ETCIF-frontend/src/pages/student/stage/PreStagePage.tsx
import { useEffect, useRef, useState } from "react";
import PageContainer from "@/components/common/PageContainer";
import { AsideMainLayout } from "@/layouts";
import { PreStageAside, PreStageMain } from "@/components/student";
import type { ResourceItem } from "@/types/experimentData";
import { trackPreEvent } from "@/services/tracker";
import { useExperimentStore, timer } from "@/store";

export default function PreStagePage() {
  // 存储选中的资源
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const currentExperimentId = useExperimentStore((s) => s.currentExperimentId);
  const selectedResourceRef = useRef<ResourceItem | null>(null);

  const timerName = `pre_resource_${currentExperimentId ?? "unknown"}`;

  useEffect(() => {
    selectedResourceRef.current = selectedResource;
  }, [selectedResource]);

  const reportResourceDuration = (item: ResourceItem | null) => {
    if (!item) return;
    if (!currentExperimentId) return;
    const path = item.url?.trim();
    if (!path) return;

    timer.stop(timerName);
    const duration = timer.getTime(timerName);
    timer.reset(timerName);

    trackPreEvent({
      experiment_id: currentExperimentId.toString(),
      resource_id: item.id.toString(),
      resource_name: item.name,
      path,
      duration,
    }).catch(console.error);
  };

  useEffect(() => {
    return () => {
      reportResourceDuration(selectedResourceRef.current);
    };
  }, [currentExperimentId]);

  const handleSelectResource = (item: ResourceItem) => {
    if (selectedResource && selectedResource.id === item.id) {
      return;
    }

    reportResourceDuration(selectedResource);
    setSelectedResource(item);
    timer.start(timerName);
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
