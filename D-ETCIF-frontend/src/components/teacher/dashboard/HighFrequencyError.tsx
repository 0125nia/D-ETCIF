// Package dashboard
// D-ETCIF-frontend/src/components/teacher/dashboard/HighFrequencyError.tsx
import type { HighFreqError } from "@/types/dashboard";

interface Props {
  data: HighFreqError[];
  loading: boolean;
}

export default function HighFrequencyError({ data, loading }: Props) {
  return (
    <div className="bg-white/80 p-4 rounded-lg border border-gray-100 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-orange-600 mb-3 text-center">
        高频错误知识点 Top
      </h3>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-50 rounded" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-10">
            暂无高频错误数据
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.map((item, i) => (
              <li key={i} className="py-3 flex justify-between items-center">
                <span className="text-gray-700 font-medium">{item.title}</span>
                <div className="flex items-center gap-3">
                  {/* 简单的进度条展示 */}
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-orange-400"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                  <span className="text-orange-500 font-mono text-sm w-12 text-right">
                    {item.rate}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
