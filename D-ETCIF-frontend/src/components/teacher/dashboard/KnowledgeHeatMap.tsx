import Card from "@/components/common/Card";
import ChartSkeleton from "@/components/common/ChartSkeleton";
export default function KnowledgeHeatMap() {
  return (
    <Card title="班级仪表盘/知识点热力图" className="h-full">
      <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
        <ChartSkeleton type="heatmap" title="知识点热力图" />
        {/* 这里可以接入 ECharts / G2 等热力图图表 */}
      </div>
    </Card>
  );
}
