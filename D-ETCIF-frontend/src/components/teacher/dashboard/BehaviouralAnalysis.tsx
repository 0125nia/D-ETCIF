import Card from "@/components/common/Card";
import ChartSkeleton from "@/components/common/ChartSkeleton";
export default function BehaviouralAnalysis() {
  return (
    <Card title="学生实时行为分析" className="h-full">
      <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
        <ChartSkeleton type="radar" title="学生行为雷达图" />
        {/* 这里可以接入学生行为分析图表 */}
      </div>
    </Card>
  );
}
