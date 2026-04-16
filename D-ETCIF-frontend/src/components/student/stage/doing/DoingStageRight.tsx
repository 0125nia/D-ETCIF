// Package doing
// D-ETCIF-frontend/src/components/student/stage/doing/DoingStageRight.tsx
import { Card } from "@/components/common";
import { useFeedbackStore } from "@/store";
import ReactMarkdown from "react-markdown";
import { FeedbackModal } from "@/components/common";

export default function DoingStageRight() {
  const { feedbackList } = useFeedbackStore();

  //  severity => 状态灯表情 → 新增 success 🟢
  const getSeverityIcon = (severity: "warning" | "error" | "success") => {
    if (severity === "success") return "🟢";
    return severity === "warning" ? "🟠" : "🔴";
  };

  // 过滤反馈列表，只显示及时反馈和路径推荐（即 "即时提醒" 和 "思路引导"）
  const filteredFeedbackList = feedbackList.filter(
    (item) => item.type === "即时提醒" || item.type === "思路引导"
  );

  return (
    <div className="flex flex-col gap-5 h-full">
      <Card
        title={`反馈列表 (${filteredFeedbackList.length})`}
        className="flex-1 overflow-hidden rounded-xl border-0 shadow-sm"
      >
        <div className="p-5 h-full overflow-y-auto">
          {filteredFeedbackList.length > 0 ? (
            <div className="space-y-3">
              {filteredFeedbackList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => FeedbackModal.show(item)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-3
                    ${
                      item.severity === "success"
                        ? "bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100/70"
                        : item.severity === "warning"
                          ? "bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100/50"
                          : "bg-red-50 border-red-200 hover:border-red-300 hover:bg-red-100/50"
                    }
                  `}
                >
                  <div className="mt-1 text-lg">
                    {getSeverityIcon(item.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 mb-1">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              {/* <div className="text-3xl">📭</div> */}
              <div>暂无实时反馈</div>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="执行记录"
        className="h-[200px] rounded-xl border-0 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
          <div>历史执行记录</div>
        </div>
      </Card>
    </div>
  );
}
