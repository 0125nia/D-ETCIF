import PageContainer from "@/components/common/PageContainer";

import KnowledgeHeatMap from "@/components/teacher/dashboard/KnowledgeHeatMap";
import BehaviouralAnalysis from "@/components/teacher/dashboard/BehaviouralAnalysis";
import PreWarning from "@/components/teacher/dashboard/PreWarning";

export default function DashboardPage() {
  return (
    <PageContainer title="教学看板">
      {/* 顶部区域：2列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 卡片 1: 班级仪表盘 / 知识点热力图 */}
        <KnowledgeHeatMap />

        {/* 卡片 2: 学生实时行为分析 */}
        <BehaviouralAnalysis />
      </div>

      {/* 底部区域：通栏卡片 */}
      <PreWarning />
    </PageContainer>
  );
}
