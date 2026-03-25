import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

export default function PostStageMain() {
  return (
    <Card title="实验总结与报告编辑" className="h-full">
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            本次实验你学到了什么？
          </label>
          <textarea
            className="w-full border border-gray-200 rounded p-3 h-40 resize-none"
            placeholder="请输入你的实验总结..."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            遇到的问题与解决方法
          </label>
          <textarea
            className="w-full border border-gray-200 rounded p-3 h-32 resize-none"
            placeholder="请输入问题描述..."
          />
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-3 mt-6">
          <Button variant="primary">保存总结</Button>
          <Button variant="ghost">重置</Button>
          <Button variant="danger">提交最终版本</Button>
        </div>
      </div>
    </Card>
  );
};