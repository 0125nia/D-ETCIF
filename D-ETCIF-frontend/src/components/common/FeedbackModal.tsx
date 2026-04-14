// Package common
// D-ETCIF-frontend/src/components/common/FeedbackModal.tsx
import ReactMarkdown from "react-markdown";
import { createRoot } from "react-dom/client";
import { Card } from "@/components/common";
import type { Feedback } from "@/types/feedback";

// 弹窗内容组件
function FeedbackContent({
  fd,
  onClose,
}: {
  fd: Feedback;
  onClose: () => void;
}) {
  // 状态灯图标 → 新增 🟢
  const severityIcon =
    fd.severity === "success" ? "🟢" : fd.severity === "warning" ? "🟠" : "🔴";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl">
        <Card
          title={`${severityIcon} ${fd.type} - ${fd.title}`}
          className="relative shadow-xl rounded-xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>

          <div className="prose prose-sm max-w-none p-4 max-h-[70vh] overflow-y-auto">
            <ReactMarkdown>{fd.content}</ReactMarkdown>
          </div>
        </Card>
      </div>
    </div>
  );
}

const FeedbackModal = {
  show(fd: Feedback) {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);

    function close() {
      root.unmount();
      document.body.removeChild(div);
    }

    root.render(<FeedbackContent fd={fd} onClose={close} />);
    return close;
  },
};

export default FeedbackModal;
