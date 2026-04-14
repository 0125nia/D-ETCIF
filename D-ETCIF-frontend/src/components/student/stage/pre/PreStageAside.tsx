// Package pre
// D-ETCIF-frontend/src/components/student/stage/pre/PreStageAside.tsx
import { List } from "@/components/common";
import { useEffect, useState } from "react";
import { getPreExperimentResources } from "@/services/experiment";
import type { ResourceItem } from "@/types/experimentData";
import { transformToResourceTree } from "@/utils/transform";

export default function PreStageAside({
  selectedResource,
  onSelect,
}: {
  selectedResource: ResourceItem | null;
  onSelect: (item: ResourceItem) => void;
}) {
  const [resources, setResources] = useState<ResourceItem[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getPreExperimentResources();
        const treeData = transformToResourceTree(data);
        setResources(treeData);
      } catch (err) {
        console.error("加载资源失败", err);
      }
    };

    fetchResources();
  }, []);
  return (
    <List
      data={resources}
      renderItem={(item) => (
        <div
          onClick={() => onSelect(item)}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            borderRadius: "4px",
            backgroundColor:
              selectedResource?.id === item.id ? "#e6f7ff" : "#fff",
          }}
        >
          {item.name}
        </div>
      )}
    />
  );
}
