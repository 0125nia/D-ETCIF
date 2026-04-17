// Package dashboard
// D-ETCIF-frontend/src/pages/teacher/dashboard/Dashboard.tsx
import { useEffect, useState } from "react";
import PageContainer from "@/components/common/PageContainer";
import KnowledgeHeatMap from "@/components/teacher/dashboard/KnowledgeHeatMap";
import PreWarning from "@/components/teacher/dashboard/PreWarning";
import BehaviouralAnalysis from "@/components/teacher/dashboard/BehaviouralAnalysis";
import {
  getHeatmapData,
  getBehaviorData,
  getWarningData,
} from "@/services/dashboard";
import type { HeatmapItem, BehaviorData, WarningData } from "@/types/dashboard";

export default function Dashboard() {
  const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);
  const [behavior, setBehavior] = useState<BehaviorData | null>(null);
  const [warning, setWarning] = useState<WarningData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [hRes, bRes, wRes] = await Promise.all([
          getHeatmapData(),
          getBehaviorData(),
          getWarningData(),
        ]);

        setHeatmap(hRes);
        setBehavior(bRes);
        setWarning(wRes);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        仪表盘 - 班级学习概况
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 数据通过 Props 注入，组件彻底变纯 */}
        <KnowledgeHeatMap data={heatmap} loading={loading} />
        <BehaviouralAnalysis data={behavior} loading={loading} />
      </div>

      <div className="mt-6">
        <PreWarning data={warning} loading={loading} />
      </div>
    </PageContainer>
  );
}
