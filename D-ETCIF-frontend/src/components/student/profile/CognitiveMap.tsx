// Package profile
// D-ETCIF-frontend/src/components/student/profile/CognitiveMap.tsx

import { ChartSkeleton } from "@/components/common";
import Card from "@/components/common/Card";
import ForceGraph2D from "react-force-graph-2d";
import type { CognitiveMapData } from "@/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  data: CognitiveMapData | null;
  loading: boolean;
}

const CognitiveMap = ({ data, loading }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 256 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 256,
      });
    }
  }, [loading]);

  // 骨架屏逻辑：加载中或无数据时显示
  if (loading || !data || data.nodes.length === 0) {
    return (
      <Card title="个人认知图谱" className="flex-1 md:mb-0 md:mr-6">
        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <ChartSkeleton />
        </div>
      </Card>
    );
  }

  // 这里的映射逻辑保证了 react-force-graph 的内部引用正确
  const graphData = {
    nodes: data.nodes.map((node) => ({ ...node })),
    links: data.links.map((link) => ({ ...link })),
  };

  const getNodeColor = (node: any) => {
    return node.type === "Student" ? "#4f46e5" : "#10b981";
  };

  return (
    <Card title="个人认知图谱" className="flex-1 md:mb-0 md:mr-6">
      <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel={(node: any) => `${node.name} | 实验：${node.expid}`}
          nodeColor={getNodeColor}
          linkWidth={(link: any) => (link.value || 1) * 3}
          nodeRelSize={6}
          linkColor={() => "#9ca3af"}
          cooldownTicks={100}
        />
      </div>
    </Card>
  );
};

export default CognitiveMap;
