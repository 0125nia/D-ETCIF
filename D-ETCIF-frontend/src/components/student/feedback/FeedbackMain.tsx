import { Card } from "@/components/common";
export default function FeedbackMain() {
  return (
    <Card title="具体反馈" className="h-full">
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className="text-xl mb-2 text-blue-600">"未填充文本"</p>
        <p className="text-sm text-gray-400">
          这里可展示富文本、图表、评价详情
        </p>
      </div>
    </Card>
  );
}
