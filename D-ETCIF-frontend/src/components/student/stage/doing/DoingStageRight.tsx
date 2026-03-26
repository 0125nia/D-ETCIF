import { Card } from "@/components/common";
import { useFeedbackStore } from "@/store";
import ReactMarkdown from "react-markdown";


export default function DoingStageRight() {

  const { selectedFeedback } = useFeedbackStore();
  return (
    <>
      {/* 实时反馈列表 */}
      <Card title="实时反馈列表" className="flex-1">
        <div className="text-gray-500 h-full flex items-center justify-center">
          运行日志、报错信息
        </div>
        <ReactMarkdown>
          {selectedFeedback}
        </ReactMarkdown>
        
      </Card>
      {/* 执行记录 */}
      <Card title="执行记录" className="h-[200px]">
        <div className="text-gray-500 h-full flex items-center justify-center">
          历史执行记录
        </div>
      </Card>
    </>
  );
}
