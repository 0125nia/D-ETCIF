// Package dashboard
// D-ETCIF-frontend/src/components/teacher/dashboard/LowConfidence.tsx
import type { LowConfidenceStudent } from "@/types/dashboard";

interface Props {
  data: LowConfidenceStudent[];
  loading: boolean;
}

export default function LowConfidence({ data, loading }: Props) {
  return (
    <div className="bg-white/80 p-4 rounded-lg border border-gray-100 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-red-600 mb-3 text-center">
        低置信度学生 Top
      </h3>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.map((item, i) => (
              <li key={i} className="py-3 flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  {item.name}{" "}
                  <small className="text-gray-400">({item.subject})</small>
                </span>
                <span className="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-mono">
                  置信度: {item.score.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
