// Package common
// D-ETCIF-frontend/src/components/common/ChartSkeleton.tsx
import React from "react";

interface ChartSkeletonProps {
  type?: "bar" | "line" | "pie" | "heatmap" | "radar";
  title?: string;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  type = "chart",
  title,
}) => {
  const config = {
    chart: { text: "图表区域" },
    heatmap: { text: "热力图布局" },
    radar: { text: "雷达坐标图" },
  };

  const current = config[type as keyof typeof config] || config.chart;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
      <div className="w-16 h-16 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-sm">{title || `(${current.text}加载中...)`}</p>
    </div>
  );
};

export default ChartSkeleton;
