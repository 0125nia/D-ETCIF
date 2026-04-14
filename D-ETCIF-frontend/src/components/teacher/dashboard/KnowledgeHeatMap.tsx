// Package dashboard
// D-ETCIF-frontend/src/components/teacher/dashboard/KnowledgeHeatMap.tsx
import Card from "@/components/common/Card";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";
import type { HeatmapItem } from "@/types/dashboard";

interface Props {
  data: HeatmapItem[];
  loading: boolean;
}

export default function KnowledgeHeatMap({ data, loading }: Props) {
  // 提取章节
  const subjects = Array.from(
    new Set(data.map((item) => item.group || "其他")),
  );

  // 映射 Y 轴索引
  const chartData = data.map((item) => ({
    name: item.name,
    subject: item.group || "其他",
    value: item.value ?? 0,
    yIndex: subjects.indexOf(item.group || "其他"),
  }));

  const dynamicHeight = Math.max(350, subjects.length * 100 + 100);

  const colorMap: Record<string, string> = {
    excellent: "#10b981",
    good: "#3b82f6",
    warning: "#f59e0b",
    danger: "#ef4444",
  };

  const getStatus = (val: number) => {
    if (val >= 80) return "excellent";
    if (val >= 60) return "good";
    if (val >= 40) return "warning";
    return "danger";
  };

  if (!loading && data.length === 0) {
    return (
      <Card title="班级知识点掌握热力图" className="h-full">
        <div className="h-64 flex items-center justify-center text-gray-400">
          暂无班级数据
        </div>
      </Card>
    );
  }

  return (
    <Card title="班级知识点掌握热力图" className="h-full">
      <div style={{ height: `${dynamicHeight}px` }} className="w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full animate-pulse bg-gray-50 rounded-lg text-gray-400">
            加载热力图中...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 60, bottom: 90, left: 30 }}>
              <defs>
                {Object.entries(colorMap).map(([key, color]) => (
                  <radialGradient
                    id={`grad-${key}`}
                    key={key}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.2} />
                  </radialGradient>
                ))}
              </defs>
              <XAxis
                type="category"
                dataKey="name"
                interval={0}
                tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
                height={80}
              />
              <YAxis
                type="number"
                dataKey="yIndex"
                domain={[-0.5, subjects.length - 0.5]}
                ticks={subjects.map((_, i) => i)}
                tickFormatter={(val) => subjects[val] || ""}
                width={70}
                tick={{ fontSize: 12 }}
              />
              <ZAxis type="number" dataKey="value" range={[0, 100]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-md text-sm">
                        <p className="font-bold text-gray-700">{d.name}</p>
                        <p className="text-gray-500">
                          掌握度：
                          <span className="text-blue-500 font-bold">
                            {d.value}%
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                data={chartData}
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (typeof cx !== "number" || typeof cy !== "number")
                    return null;
                  const radius = 10 + (payload.value / 100) * 15;
                  const status = getStatus(payload.value);
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={`url(#grad-${status})`}
                      stroke={colorMap[status]}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
