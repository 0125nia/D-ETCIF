// Package profile
// D-ETCIF-frontend/src/components/student/profile/StudyReport.tsx
import { useMemo } from "react";
import Card from "@/components/common/Card";
import StatItem from "@/components/common/StatItem";
import type { StudyReportData } from "@/types";

interface Props {
  data: StudyReportData | null;
  loading: boolean;
}

export default function StudyReport({ data, loading }: Props) {
  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { label: "学习总时长", value: data.total_time, unit: "分钟" },
      { label: "完成实验", value: data.total_exp, unit: "个" },
      {
        label: "报错率",
        value: data.error_rate,
        unit: "%",
        valueColor: "text-red-500",
      },
      {
        label: "平均分",
        value: data.average_score,
        unit: "分",
        valueColor: "text-green-500",
      },
    ];
  }, [data]);

  return (
    <Card title="实验学习情况" className="mb-6">
      {loading || !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-12 mt-1"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              label={stat.label}
              value={stat.value}
              unit={stat.unit}
              valueColor={stat.valueColor}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
