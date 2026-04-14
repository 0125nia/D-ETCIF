// Package utils
// D-ETCIF-frontend/src/utils/transform.ts
import type { PreExperimentData, ResourceItem } from "@/types/experimentData";

export function transformToResourceTree(
  list: PreExperimentData[],
): ResourceItem[] {
  const map = new Map<string, ResourceItem>();
  let pid = 1;

  for (const item of list) {
    const parentName = item.source_name;

    if (!map.has(parentName)) {
      map.set(parentName, {
        id: pid++,
        name: parentName,
        children: [],
      });
    }

    map.get(parentName)!.children!.push({
      id: item.id,
      name: item.source_child_name,
      url: item.url,
      type: item.type,
    });
  }

  return Array.from(map.values());
}
