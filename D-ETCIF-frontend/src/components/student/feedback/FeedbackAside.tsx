// Package feedback
// D-ETCIF-frontend/src/components/student/feedback/FeedbackAside.tsx
import { List } from "@/components/common";
import { useFeedbackStore } from "@/store";
import { useEffect, useState } from "react";
import { getStudentFeedbackList } from "@/services";

export default function FeedbackAside() {
  const experimentList = useFeedbackStore((s) => s.experimentList);
  const setExperimentList = useFeedbackStore((s) => s.setExperimentList);
  const setSelectedFeedback = useFeedbackStore((s) => s.setSelectedFeedback);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFeedbackList = async () => {
      const res = await getStudentFeedbackList();
      setExperimentList(res ?? []);
    };

    fetchFeedbackList().catch(() => {
      setExperimentList([]);
    });
  }, [setExperimentList]);

  return (
    <div className="h-full overflow-auto p-3">
      <h2 className="font-semibold text-lg mb-3">实验列表</h2>

      <List
        data={experimentList}
        renderItem={(item) => (
          <div className="border-b border-gray-100 py-2">
            <div
              onClick={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              className="flex justify-between items-center p-2 cursor-pointer hover:bg-blue-50 rounded transition-colors"
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-400 text-sm">
                {expandedId === item.id ? "▲ 收起" : "▼ 展开"}
              </span>
            </div>

            {expandedId === item.id && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {item.feedbacks?.length ? (
                  item.feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      onClick={() => setSelectedFeedback(fb)}
                      className="p-2 text-sm rounded hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {(fb.title + fb.content).length > 20
                        ? `${(fb.title + fb.content).slice(0, 20)}...`
                        : fb.title + fb.content}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-400">暂无反馈</div>
                )}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
