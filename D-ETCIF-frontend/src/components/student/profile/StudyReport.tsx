import { useMemo } from "react";
import Card from "@/components/common/Card";
import StatItem from "@/components/common/StatItem";
import { useProfileStore } from "@/store/profile.store";

export default function StudyReport() {
  const { studyReport, loading, error } = useProfileStore();

  const stats = useMemo(() => {
    if (!studyReport) return [];
    return [
      { label: "学习总时长", value: studyReport.total_time, unit: "分钟" },
      { label: "完成实验", value: studyReport.total_exp, unit: "个" },
      { label: "报错率", value: studyReport.error_rate, unit: "%", valueColor: "text-red-500" },
      { label: "平均分", value: studyReport.average_score, unit: "分", valueColor: "text-green-500" },
    ];
  }, [studyReport]);

  return (
    <Card title="实验学习情况" className="mb-6">
      {error ? (
        <div className="flex items-center justify-center py-6 text-red-500 bg-red-50 rounded-lg border border-red-100">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      ) : loading || !studyReport ? (
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
