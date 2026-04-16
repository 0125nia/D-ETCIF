// Package feedback
// D-ETCIF-frontend/src/components/student/feedback/FeedbackMain.tsx
import { Card } from "@/components/common";
import { useFeedbackStore } from "@/store";
import ReactMarkdown from "react-markdown";

export default function FeedbackMain() {
  const selectedFeedback = useFeedbackStore((s) => s.selectedFeedback);

  return (
    <Card title="反馈详情" className="h-full">
      <div className="h-full flex flex-col">
        {selectedFeedback ? (
          <div className="flex-1 p-6 overflow-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
              <div className="text-gray-900 font-semibold mb-2">
                {selectedFeedback.title}
              </div>

              {selectedFeedback.type === "思路引导" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{selectedFeedback.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.content}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-lg">请在左侧选择一条反馈查看</p>
          </div>
        )}
      </div>
    </Card>
  );
}
