import { ChartSkeleton } from "@/components/common";
import Card from "@/components/common/Card";
import { useProfileStore } from "@/store/profile.store";
import ForceGraph2D from "react-force-graph-2d";
import type { CognitiveMapData } from "@/types/domain/profile";

const CognitiveMap = () => {

  const { cognitiveMap } = useProfileStore();
  if (!cognitiveMap) {
    return (
      <Card title="个人认知图谱" className="flex-1 md:mb-0 md:mr-6">
        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <ChartSkeleton />
        </div>
      </Card>
    );
  }

  const graphData = {
    nodes: cognitiveMap.nodes.map(node => ({
      id: node.id,
      name: node.name,
      expid: node.expid,
      type: node.type
    })),
    links: cognitiveMap.links.map(link => ({
      source: link.source,
      target: link.target,
      value: link.value
    }))
  };


  const getNodeColor = (node: CognitiveMapData['nodes'][0]) => {
    return node.type === "Student" ? "#4f46e5" : "#10b981";
  };
  return (
    <Card title="个人认知图谱" className="flex-1 md:mb-0 md:mr-6">
      <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel={(node: CognitiveMapData['nodes'][0]) => `${node.name} | 实验：${node.expid}`}
          nodeColor={getNodeColor}
          linkWidth={(link: CognitiveMapData['links'][0]) => link.value * 3}
          nodeRelSize={6}
          linkColor={() => "#9ca3af"}
          cooldownTicks={100}
        />
      </div>
    </Card>
  );
};

export default CognitiveMap;
