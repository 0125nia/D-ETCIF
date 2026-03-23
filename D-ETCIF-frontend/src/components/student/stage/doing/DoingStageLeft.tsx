import { Card } from "@/components/common";

export default function DoingStageLeft() {
  return (
    <Card title="实验要求" className="h-full">
      <div className="text-gray-500 h-[calc(100%-40px)] flex items-center justify-center">
        实验描述、要求文档区域
      </div>
    </Card>
  );
}
