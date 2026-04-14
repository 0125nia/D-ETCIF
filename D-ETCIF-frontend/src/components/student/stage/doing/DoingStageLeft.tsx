// Package doing
// D-ETCIF-frontend/src/components/student/stage/doing/DoingStageLeft.tsx
import { Card } from "@/components/common";
import { useState } from "react";
import { getDoingExperimentContent } from "@/services/experiment";
import type { DoingTask } from "@/types/experimentData";
import { useEffect } from "react";

export default function DoingStageLeft() {
  const [topicList, setTopicList] = useState<DoingTask[]>([]);
  // 控制折叠
  const [openIndex, setOpenIndex] = useState(0); // 默认打开第1题

  useEffect(() => {
    getDoingExperimentContent().then((res) => {
      setTopicList(res || []);
    });
  }, []);

  return (
    <Card title="实验要求" className="h-full overflow-y-auto">
      <div
        className="text-gray-700 space-y-4"
        style={{
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
          lineHeight: "1.8",
          fontSize: "15px",
        }}
      >
        {topicList.map((item, index) => (
          <div
            className="border border-gray-200 rounded-lg overflow-hidden"
            key={item.id}
          >
            <div
              className={`px-4 py-3 font-bold cursor-pointer flex justify-between items-center transition-colors ${
                openIndex === index
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-700"
              }`}
              onClick={() => setOpenIndex(index)}
            >
              <span>{item.experiment_name || `题目 ${index + 1}`}</span>
              <span className="text-xs">{openIndex === index ? "▲" : "▼"}</span>
            </div>
            {openIndex === index && (
              <div className="p-4 whitespace-pre-wrap text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                {item.topic_details}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
