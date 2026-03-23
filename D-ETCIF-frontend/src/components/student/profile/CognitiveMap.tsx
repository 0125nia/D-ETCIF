import Card from "@/components/common/Card";
import ChartSkeleton from "@/components/common/ChartSkeleton";

const CognitiveMap = () => {
  return (
    <Card title="个人认知图谱" className="flex-1 md:mb-0 md:mr-6">
      <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <ChartSkeleton type="radar" title="认知图谱加载中..." />
      </div>
    </Card>
  );
};

export default CognitiveMap;
