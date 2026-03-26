import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import PostStageScore from "./PostStageScore";

export default function PostStageRight() {
  return (
    <div className="space-y-6 h-full">
      {/* 实验状态 */}
      <Card title="实验状态">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>实验进度</span>
            <span className="text-blue-600">100%</span>
          </div>
          <div className="flex justify-between">
            <span>报告状态</span>
            <span className="text-orange-600">未提交</span>
          </div>
          <div className="flex justify-between">
            <span>评分状态</span>
            <span className="text-orange-600">未完成</span>
          </div>
        </div>
      </Card>

      <PostStageScore />
      {/* 报告上传 */}
      <Card title="报告上传">
        <div className="space-y-4">
          <div className="border border-dashed border-gray-300 rounded p-4 text-center text-sm text-gray-500">
            暂无上传文件
          </div>
          <Button variant="primary" className="w-full">
            选择文件上传
          </Button>
        </div>
      </Card>
    </div>
  );
}
