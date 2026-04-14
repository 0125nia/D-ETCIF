// Package dashboard
// D-ETCIF-frontend/src/components/teacher/dashboard/BehaviouralAnalysis.tsx
import Card from "@/components/common/Card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { BehaviorData } from "@/types/dashboard";

interface Props {
  data: BehaviorData | null;
  loading: boolean;
}

export default function BehaviouralAnalysis({ data, loading }: Props) {
  const chartData =
    data?.dimensions.map((dim, i) => ({
      dimension: dim,
      score: data.values[i],
    })) || [];

  return (
    <Card title="班级整体行为分析" className="h-full">
      <div className="h-[300px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50 animate-pulse text-gray-400 rounded-lg">
            分析中...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 13, fill: "#4b5563" }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar
                name="班级平均"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
