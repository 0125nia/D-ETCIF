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
  // useEffect(() => {
  //   const loadMockData = async () => {
  //     setLoading(true);
  //     // 模拟 1 秒网络延迟
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // 1. 热力图数据：模拟两个章节的知识点掌握情况
  //     const mockHeatmap: HeatmapItem[] = [
  //       { id: "1", name: "可视化定义", value: 92, group: "第一章：基础理论" },
  //       { id: "2", name: "数据类型识别", value: 78, group: "第一章：基础理论" },
  //       { id: "3", name: "视觉编码原理", value: 45, group: "第一章：基础理论" },
  //       { id: "4", name: "常用库安装", value: 88, group: "第二章：环境搭建" },
  //       { id: "5", name: "Jupyter配置", value: 62, group: "第二章：环境搭建" },
  //       { id: "6", name: "虚拟环境隔离", value: 35, group: "第二章：环境搭建" },
  //     ];

  //     // 2. 行为分析：五个维度的班级平均分
  //     const mockBehavior: BehaviorData = {
  //       dimensions: ["参与度", "代码规范", "逻辑思维", "Debug能力", "理论基础"],
  //       values: [85, 62, 74, 48, 90],
  //     };

  //     // 3. 预警数据
  //     const mockWarning: WarningData = {
  //       lowConfidence: [
  //         { name: "陈同学", subject: "实验 1.1", score: 0.24 },
  //         { name: "林同学", subject: "实验 1.2", score: 0.31 },
  //         { name: "张同学", subject: "实验 1.1", score: 0.38 },
  //       ],
  //       highFrequencyError: [
  //         { title: "Matplotlib 对象层级理解", rate: 72 },
  //         { title: "Pandas 索引切片语法", rate: 58 },
  //         { title: "数据清洗中的空值处理", rate: 44 },
  //       ],
  //     };

  //     setHeatmap(mockHeatmap);
  //     setBehavior(mockBehavior);
  //     setWarning(mockWarning);
  //     setLoading(false);
  //   };

  //   loadMockData();
  // }, []);
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [hRes, bRes, wRes] = await Promise.all([
          getHeatmapData(),
          getBehaviorData(),
          getWarningData(),
        ]);
        setHeatmap(hRes.data.data);
        setBehavior(bRes.data.data);
        setWarning(wRes.data.data);
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
