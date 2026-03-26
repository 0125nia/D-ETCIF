import { useEffect } from "react";
import PageContainer from "@/components/common/PageContainer";
import KnowledgeHeatMap from "@/components/teacher/dashboard/KnowledgeHeatMap";
import PreWarning from "@/components/teacher/dashboard/PreWarning";
import BehaviouralAnalysis from "@/components/teacher/dashboard/BehaviouralAnalysis";
import { useDashboardStore } from "@/store/dashboard.store";

export default function DashboardPage() {
  const fetchDashboardData = useDashboardStore((s) => s.fetchDashboardData);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        仪表盘 - 班级学习概况
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：知识点热力图 */}
        <KnowledgeHeatMap />

        {/* 右侧：行为分析雷达图 */}
        <BehaviouralAnalysis />
      </div>

      <div className="mt-6">
        {/* 下方：预警系统（低置信度 + 高频错误） */}
        <PreWarning />
      </div>
    </PageContainer>
  );
}
